export const dynamic = "force-dynamic";
import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to Database");
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);

    connection.isConnected = db.connections[0].readyState;

    console.log("DB connected successfully");
  } catch (err) {
    console.error("DB connection failed", err);
    throw err;
  }
}

export default dbConnect;
