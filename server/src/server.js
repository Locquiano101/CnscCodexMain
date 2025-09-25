// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import session from "express-session";
import MongoStore from "connect-mongo";
import apiRoutes from "./routers.js";

dotenv.config();

const app = express();
const DB = process.env.MONGO_URI;
const PORT = process.env.PORT;

// Connect to MongoDB
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

// Middleware
app.use(
  cors({
    origin: true, // Accept all origins
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// // Session setup with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: DB,
      collectionName: "sessions",
    }),
    cookie: { httpOnly: true },
    rolling: true,
  })
);

// // Inactivity timeout middleware
const INACTIVITY_GRACE = 5000; // 5 seconds
const INACTIVITY_TIMEOUT = 2629800000; // 1 month

const activityMiddleware = (req, res, next) => {
  const now = Date.now();
  if (req.session.lastActivity) {
    const inactiveTime = now - req.session.lastActivity;
    if (inactiveTime > INACTIVITY_GRACE + INACTIVITY_TIMEOUT) {
      req.session.destroy((err) => {
        if (err) return next(err);
        return res.json({ message: "Session expired due to inactivity" });
      });
      return; // Prevent further response
    }
  }
  req.session.lastActivity = now;
  next();
};

// API routes
app.use("/api", activityMiddleware, apiRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend Server running at ${process.env.VITE_API_ROUTER}`);
  console.log(`Backend Server running at http://0.0.0.0:${PORT}`);
});
