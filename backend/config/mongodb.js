/**
 * MongoDB connection configuration for the backend application.
 * Handles connecting to the MongoDB database using Mongoose.
 *
 * @module config/mongodb
 */
import mongoose from "mongoose";

/**
 * Connects to the MongoDB database using the connection string from environment variables.
 * - Logs a success message on successful connection.
 * - Logs an error and exits the process if connection fails.
 *
 * @function
 * @async
 * @returns {Promise<void>} Resolves when the connection is established.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGO_URI}MeroDoctor`, {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
