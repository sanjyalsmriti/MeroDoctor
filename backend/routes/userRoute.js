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
  searchDoctorsWithNgrams,
  getNgramSearchSuggestions,
  matchPatientWithDoctors,
  findSimilarDoctors,
  getNgramStatistics,
  getSimilarPatients,
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

/**
 * @route POST /search-ngrams
 * @desc Search doctors using N-gram algorithm (requires authentication)
 * @access Protected
 */
userRouter.post("/search-ngrams", authUser, searchDoctorsWithNgrams);

/**
 * @route GET /suggestions-ngrams
 * @desc Get search suggestions using N-grams (requires authentication)
 * @access Protected
 */
userRouter.get("/suggestions-ngrams", authUser, getNgramSearchSuggestions);

/**
 * @route POST /match-patient
 * @desc Match patient with doctors using N-gram algorithm (requires authentication)
 * @access Protected
 */
userRouter.post("/match-patient", authUser, matchPatientWithDoctors);

/**
 * @route POST /similar-doctors
 * @desc Find similar doctors using N-gram similarity (requires authentication)
 * @access Protected
 */
userRouter.post("/similar-doctors", authUser, findSimilarDoctors);

/**
 * @route GET /ngram-statistics
 * @desc Get N-gram search statistics (requires authentication)
 * @access Protected
 */
userRouter.get("/ngram-statistics", authUser, getNgramStatistics);

/**
 * @route POST /similar-patients
 * @desc Get similar patients for a doctor (requires authentication)
 * @access Protected
 */
userRouter.post("/similar-patients", authUser, getSimilarPatients);

export default userRouter;
