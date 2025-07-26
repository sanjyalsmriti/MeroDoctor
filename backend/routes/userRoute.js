/**
 * Express router for user-related API endpoints.
 * Handles routes for user registration, authentication, profile management, appointments, and payment details.
 *
 * @module routes/userRoute
 */
import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  getPaymentDetails,
  getProfile,
  listAppointments,
  loginUser,
  registerUser,
  updateProfile,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

/**
 * @route POST /register
 * @desc Register a new user
 * @access Public
 */
userRouter.post("/register", registerUser);

/**
 * @route POST /login
 * @desc User login
 * @access Public
 */
userRouter.post("/login", loginUser);

/**
 * @route GET /get-profile
 * @desc Get user profile (requires authentication)
 * @access Protected
 */
userRouter.get("/get-profile", authUser, getProfile);

/**
 * @route POST /update-profile
 * @desc Update user profile (requires authentication, supports image upload)
 * @access Protected
 */
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);

/**
 * @route POST /book-appointment
 * @desc Book an appointment with a doctor (requires authentication)
 * @access Protected
 */
userRouter.post("/book-appointment", authUser, bookAppointment);

/**
 * @route GET /appointments
 * @desc Get all appointments for the authenticated user
 * @access Protected
 */
userRouter.get("/appointments", authUser, listAppointments);

/**
 * @route POST /cancel-appointment
 * @desc Cancel an appointment (requires authentication)
 * @access Protected
 */
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

/**
 * @route POST /get-payment-details
 * @desc Get payment details by transaction UUID (requires authentication)
 * @access Protected
 */
userRouter.post("/get-payment-details", authUser, getPaymentDetails);

export default userRouter;
