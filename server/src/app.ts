
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRouter from "./routes/auth";

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173,http://localhost:5174,https://aquamarine-profiterole-f0eb27.netlify.app"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      console.error("CORS blocked origin:", origin);
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root health check
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Mini CRM API is running",
    status: "OK",
  });
});

// API health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "CRM API is running",
    status: "OK",
  });
});

// Authentication endpoints
app.use("/api/auth", authRouter);

// Unknown route handler
app.use((_req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

export default app;
