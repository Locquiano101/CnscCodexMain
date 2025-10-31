// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import MongoStore from "connect-mongo";

import apiRoutes from "./routers.js";

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

// -------------------- Profanity Middleware --------------------
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

// -------------------- Middleware --------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));
// Serve uploaded files

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

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

// -------------------- Inactivity + Profanity Middleware --------------------
const INACTIVITY_GRACE = 5000; // 5 seconds
const INACTIVITY_TIMEOUT = 2629800000; // ~1 month

const activityMiddleware = (req, res, next) => {
  if (req.path === "/notifications") return next();

  const content = [
    JSON.stringify(req.body || {}),
    JSON.stringify(req.query || {}),
    JSON.stringify(req.params || {}),
  ]
    .join(" ")
    .toLowerCase();

  if (badWords.some((word) => content.includes(word))) {
    return res
      .status(400)
      .json({ error: "Profanity detected", rickroll: true });
  }

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

// -------------------- Routes --------------------
app.use("/api", profanityMiddleware, activityMiddleware, apiRoutes);

// app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // LOCALHOST
app.use("/uploads", express.static("/uploads")); // PROD

console.log(path.join(__dirname, "../uploads"));

// -------------------- Start Server --------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Frontend served at ${process.env.VITE_API_ROUTER}`);
  console.log(`✅ Backend running at http://0.0.0.0:${PORT}`);
});
