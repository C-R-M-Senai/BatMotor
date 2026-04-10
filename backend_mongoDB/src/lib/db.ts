/**
 * Ligação MongoDB (Mongoose). Variável: MONGODB_URI (ex.: mongodb://127.0.0.1:27017/batmotor).
 */
import "dotenv/config";
import mongoose from "mongoose";

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "[mongo] Defina MONGODB_URI no .env (ex.: mongodb://127.0.0.1:27017/batmotor)",
    );
  }
  await mongoose.connect(uri);
  console.log("[mongo] ligado a", uri.replace(/:[^:@/]+@/, ":****@"));
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
