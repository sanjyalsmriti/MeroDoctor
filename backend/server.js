/**
 * Main server entry point for the backend application.
 * Sets up Express, connects to MongoDB and Cloudinary, and mounts all API routes.
 *
 * @module server
 */
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import paymentRouter from "./routes/paymentRoute.js";

// app configuration
const app = express();
const PORT = process.env.PORT || 4000;
connectDB();
connectCloudinary();
// middleware
app.use(cors());
app.use(express.json());

/**
 * Health check endpoint to verify API is running.
 * @route GET /health
 * @returns {Object} 200 - JSON message indicating API status
 */
app.get("/health", (req, res) => {
  res.status(200).json({ message: "API is running" });
});
// api endpoints
/**
 * Mounts admin-related API routes at /api/admin
 */
app.use("/api/admin", adminRouter);
/**
 * Mounts doctor-related API routes at /api/doctor
 */
app.use("/api/doctor", doctorRouter);
/**
 * Mounts user-related API routes at /api/user
 */
app.use("/api/user", userRouter);
/**
 * Mounts payment-related API routes at /api/payment
 */
app.use("/api/payment", paymentRouter);
// start server
/**
 * Starts the Express server and listens on the specified port.
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
