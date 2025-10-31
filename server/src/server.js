// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import MongoStore from "connect-mongo";
import http from "http";
import { Server } from "socket.io";

import apiRoutes from "./routers.js";
import { Notification } from "./models/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const DB = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// -------------------- Connect to MongoDB --------------------
async function connectDB() {
  try {
    await mongoose.connect(DB);
    console.log(`✅ Connected to MongoDB at ${DB}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

connectDB();

// -------------------- Middleware --------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// -------------------- CORS --------------------
// Frontend: https://cnsc-codex.site
app.use(
  cors({
    origin: [
      "http://localhost:5173", // dev frontend
      "https://cnsc-codex.site",

      "https://access.cnsc-codex.site", // production frontend
    ],
    credentials: true, // allow cookies/session
  })
);

// -------------------- Session --------------------
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: DB,
    collectionName: "sessions",
  }),
  cookie: {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: "none", // allow cookies from a different domain
    domain: ".cnsc-codex.site", // share session between subdomains
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
  rolling: true,
});

app.use(sessionMiddleware);

// -------------------- Profanity Filter --------------------
const badWords = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "nigger",
  "faggot",
];

const profanityMiddleware = (req, res, next) => {
  const content = [
    JSON.stringify(req.body || {}),
    JSON.stringify(req.query || {}),
    JSON.stringify(req.params || {}),
  ]
    .join(" ")
    .toLowerCase();

  if (badWords.some((word) => content.includes(word))) {
    return res.status(418).json({
      error: "Profanity detected",
      rickroll: true,
      youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
  }
  next();
};

// -------------------- Activity Timeout --------------------
const INACTIVITY_GRACE = 5000; // 5 sec
const INACTIVITY_TIMEOUT = 2629800000; // ~1 month

const activityMiddleware = (req, res, next) => {
  if (req.path === "/notifications") return next();

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

// -------------------- Serve Static Files --------------------
app.use(express.static(path.join(__dirname, "client/build")));
app.use("/api/uploads", express.static(path.join(__dirname, "../uploads")));

// -------------------- HTTP + Socket.IO --------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://cnsc-codex.site",
    credentials: true,
  },
});

io.engine.use(sessionMiddleware);

io.on("connection", (socket) => {
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(userId.toString());
    console.log(`🔌 User ${userId} connected with socket ${socket.id}`);
  }

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// -------------------- Routes --------------------
app.use("/api", profanityMiddleware, activityMiddleware, apiRoutes);

// -------------------- Test Notification --------------------
app.post("/api/sendTestNotification", async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.session.userId || "admin";

    const notification = await Notification.create({
      organizationProfile: recipientId,
      sender: senderId,
      message,
    });

    io.to(recipientId.toString()).emit("notification", notification);
    res.json({ success: true, notification });
  } catch (err) {
    console.error("Error sending notification:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// -------------------- Notifications Endpoint --------------------
app.get("/notifications", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const notifications = await Notification.find({
      organizationProfile: userId,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- Start Server --------------------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Frontend allowed: https://cnsc-codex.site`);
  console.log(`✅ Backend running at: https://access.cnsc-codex.site:${PORT}`);
});
