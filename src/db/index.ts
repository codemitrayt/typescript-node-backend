import mongoose from "mongoose";
import { ENV } from "../config/index";

export const connectMongoDB = async () => {
  const DB_URL = ENV.MONGODB_URL;
  if (!DB_URL) throw Error("DB URL not specified");
  await mongoose.connect(DB_URL);
};
