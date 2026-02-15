import mongoose from "mongoose";

export default async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI not set in environment");
  }

  await mongoose.connect(MONGO_URI);
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}
