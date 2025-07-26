/**
 * Cloudinary configuration for the backend application.
 * Handles connecting and authenticating with the Cloudinary image hosting service.
 *
 * @module config/cloudinary
 */
import { v2 as cloudinary } from "cloudinary";

/**
 * Configures and connects to the Cloudinary service using environment variables.
 * - Sets the cloud name, API key, and API secret from process.env.
 * - Enables secure connections.
 * - Logs a success message on successful configuration.
 *
 * @function
 * @returns {void}
 */
const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log("Cloudinary connected successfully");
};

export default connectCloudinary;
