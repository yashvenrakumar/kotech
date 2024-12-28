const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Make sure MONGO_URI is present in environment variables
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {});

    console.log("MongoDB Connected sucessfylly");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process with failure status
  }
};

module.exports = connectDB;
