import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

const validateRuntimeConfig = (): void => {
  const missing = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"].filter(
    (key) => !process.env[key]
  );
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  if ((process.env.JWT_SECRET?.length ?? 0) < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }
  for (const origin of (process.env.CLIENT_URL ?? "").split(",")) {
    const parsed = new URL(origin.trim());
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== origin.trim()) {
      throw new Error("CLIENT_URL must contain only comma-separated web origins");
    }
  }
};

const startServer = async (): Promise<void> => {
  try {
    validateRuntimeConfig();
    await connectDB();

    app.listen(PORT, () => {
      console.log(`CRM API running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Unable to start CRM API"
    );
    process.exit(1);
  }
};

startServer();