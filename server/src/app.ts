
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard";
import customerRouter from "./routes/customers";
import dealRouter from "./routes/deals";
import taskRouter from "./routes/tasks";

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

      callback(new Error("This origin is not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health checks
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Mini CRM API is running",
    status: "OK",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "CRM API is running",
    status: "OK",
  });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/customers", customerRouter);
app.use("/api/deals", dealRouter);
app.use("/api/tasks", taskRouter);

// Unknown route handler
app.use((_req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// Error handler must be after routes and before export.
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (error.message === "This origin is not allowed") {
      res.status(403).json({
        message: "This origin is not allowed",
      });
      return;
    }

    console.error("API ERROR:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
);

export default app;
