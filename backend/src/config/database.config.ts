import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });
    console.log("Connected to Mongo database");
  } catch (error) {
    if (config.NODE_ENV === "production") {
      console.error("Error connecting to Mongo database");
      console.error(error);
      process.exit(1);
      return;
    }

    console.warn(
      "Mongo connection failed. Continuing without a database connection in development mode."
    );
    console.error(error);
  }
};

export default connectDatabase;
