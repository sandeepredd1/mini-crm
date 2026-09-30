import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`CRM API running on port ${PORT}`);
    });
  } catch {
    process.exit(1);
  }
};

startServer();