
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRouter from "./routes/auth";

// Import other routers if they exist in your project.
// import dashboardRouter from "./routes/dashboard";
// import customersRouter from "./routes/customers";
// import dealsRouter from "./routes/deals";
// import tasksRouter from "./routes/tasks";

const app = express();

const clientUrl =
  process.env.CLIENT_URL ||
  "http://localhost:5173";

// Security middleware
app.use(helmet());

// Allow the frontend to communicate with the API
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
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
  });
});

// Authentication routes
app.use("/api/auth", authRouter);

// Add these only if the corresponding router files exist.
// app.use("/api/dashboard", dashboardRouter);
// app.use("/api/customers", customersRouter);
// app.use("/api/deals", dealsRouter);
// app.use("/api/tasks", tasksRouter);

// Handle unknown routes
app.use((_req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

export default app;
