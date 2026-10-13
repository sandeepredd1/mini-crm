
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard";
import customersRouter from "./routes/customers";
import dealsRouter from "./routes/deals";
import tasksRouter from "./routes/tasks";

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error("Blocked CORS origin:", origin);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "CRM API is running",
  });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/customers", customersRouter);
app.use("/api/deals", dealsRouter);
app.use("/api/tasks", tasksRouter);

// Not found
app.use((_req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
  });
});

export default app;
