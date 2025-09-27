// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import session from "express-session";
import MongoStore from "connect-mongo";
import apiRoutes from "./routers.js";
import http from "http";
import { Server } from "socket.io";
import { Notification } from "./models/index.js"; // adjust path!
dotenv.config();

const app = express();
const DB = process.env.MONGO_URI;
const PORT = process.env.PORT;

// -------------------- Connect to MongoDB --------------------
async function connectDB() {
  try {
    await mongoose.connect(DB);
    console.log(`Connected to MongoDB at ${DB}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
}
connectDB();

// -------------------- Middleware --------------------
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api/server/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
// Session setup with MongoDB store
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: DB,
    collectionName: "sessions",
  }),
  cookie: { httpOnly: true },
  rolling: true,
});
app.use(sessionMiddleware);

// Inactivity timeout middleware
const INACTIVITY_GRACE = 5000; // 5 seconds
const INACTIVITY_TIMEOUT = 2629800000; // 1 month

const badWords = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "nigger",
  "faggot",
];
// extend this list however you like

const activityMiddleware = (req, res, next) => {
  // Allow public access to this specific endpoint
  if (req.path === "/notifications" || req.path === "//notifications") {
    return next();
  }

  // --- PROFANITY CHECK ---
  const contentSources = [
    JSON.stringify(req.body || {}),
    JSON.stringify(req.query || {}),
    JSON.stringify(req.params || {}),
  ]
    .join(" ")
    .toLowerCase();

  const hasProfanity = badWords.some((word) => contentSources.includes(word));

  if (hasProfanity) {
    return res
      .status(400)
      .json({ error: "Profanity detected", rickroll: true });
  }

  // --- INACTIVITY CHECK ---
  const now = Date.now();
  if (req.session?.lastActivity) {
    const inactiveTime = now - req.session.lastActivity;
    if (inactiveTime > INACTIVITY_GRACE + INACTIVITY_TIMEOUT) {
      req.session.destroy((err) => {
        if (err) return next(err);
        return res.json({ message: "Session expired due to inactivity" });
      });
      return;
    }
  }
  req.session.lastActivity = now;
  next();
};

// -------------------- Setup HTTP + WebSocket --------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.VITE_API_ROUTER,
    credentials: true,
  },
});

// Let Socket.IO access sessions
io.engine.use(sessionMiddleware);

// When a client connects
io.on("connection", (socket) => {
  const userId = socket.handshake.auth?.userId; // frontend must send this
  if (userId) {
    socket.join(userId.toString()); // each user in their own room
    console.log(`🔌 User ${userId} connected with socket ${socket.id}`);
  }

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// -------------------- Routes --------------------

app.use("/api", activityMiddleware, apiRoutes);

// Save + send notification
app.post("/api/sendTestNotification", async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.session.userId || "admin"; // fallback

    const notification = await Notification.create({
      organizationProfile: recipientId,
      sender: senderId,
      message,
    });

    // Emit to recipient only
    io.to(recipientId.toString()).emit("notification", notification);

    res.json({ success: true, notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Using query param (?userId=...)
app.get("/notifications", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const notifications = await Notification.find({
      organizationProfile: userId,
    }).sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- Start server --------------------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend Server running at ${process.env.VITE_API_ROUTER}`);
  console.log(`Backend Server running at http://0.0.0.0:${PORT}`);
});
