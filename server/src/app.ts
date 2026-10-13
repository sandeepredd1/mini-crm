
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRouter from "./routes/auth";

const app = express();

// Allowed frontend URLs from Render environment variables
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root route
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Mini CRM API is running",
    status: "OK",
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "CRM API is running",
    status: "OK",
  });
});

// Authentication routes
app.use("/api/auth", authRouter);

// Handle unknown routes
app.use((_req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

export default app;
