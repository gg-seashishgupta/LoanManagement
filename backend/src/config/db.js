import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB Connected");
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;
