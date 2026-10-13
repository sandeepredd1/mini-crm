import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import customerRoutes from "./routes/customers";
import dealRoutes from "./routes/deals";
import taskRoutes from "./routes/tasks";
import dashboardRoutes from "./routes/dashboard";

const app = express();
const allowedOrigins = new Set(
  (process.env.CLIENT_URL ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use(helmet());

app.use((req, res, next) => {
  const origin = req.get("origin");

  if (origin && !allowedOrigins.has(origin)) {
    res.status(403).json({
      message: "This origin is not allowed",
    });
    return;
  }

  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "CRM API is running",
  });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({
      message: "Request body must contain valid JSON",
    });
    return;
  }

  console.error("Unhandled API error:", error);
  res.status(500).json({
    message: "An unexpected server error occurred",
  });
});

export default app;