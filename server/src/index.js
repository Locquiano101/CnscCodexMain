import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.post("/api/test", (req, res) => {
  console.log("=== /api/test hit ===");
  console.log("Request body:", req.body);

  res.json({
    status: "ok",
    serverTime: new Date().toISOString(),
    received: req.body,
  });
});

// Read port from .env or fallback
const PORT = process.env.PORT || 5050;

// 👇 Important: bind to 0.0.0.0 so LAN devices can reach it
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
