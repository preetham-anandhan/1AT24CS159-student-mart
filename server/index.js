require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routers/auth");
const profileRoutes = require("./routers/profile");

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGO_URI;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected"
  });
});

app.use("/api/auth", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database unavailable" });
  }

  return next();
}, authRoutes);

app.use("/api/profile", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database unavailable" });
  }

  return next();
}, profileRoutes);

if (!mongoUri) {
  console.error("MONGO_URI is required in server/.env; authentication will be unavailable.");
} else {
  mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log("Connected to MongoDB.");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });
}

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
