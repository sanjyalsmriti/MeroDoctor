/**
 * Express router for admin-related API endpoints.
 * Handles routes for doctor management, appointments, admin authentication, and dashboard data.
 *
 * @module routes/adminRoute
 */
import express from "express";
import {
  addDoctor,
  adminDashboard,
  adminLogin,
  allDoctors,
  appointmentCancel,
  appointmentsAdmin,
  updateDoctor,
} from "../controllers/adminController.js";
import { changeAvailability } from "../controllers/doctorController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();

/**
 * @route POST /add-doctor
 * @desc Add a new doctor (requires admin authentication and image upload)
 * @access Protected
 */
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);

/**
 * @route POST /update-doctor/:doctId
 * @desc Update an existing doctor (requires admin authentication, optional image upload)
 * @access Protected
 */
adminRouter.post("/update-doctor/:doctId", authAdmin, upload.single("image"), updateDoctor);

/**
 * @route POST /login
 * @desc Admin login
 * @access Public
 */
adminRouter.post("/login", adminLogin);

/**
 * @route POST /all-doctors
 * @desc Get all doctors (requires admin authentication)
 * @access Protected
 */
adminRouter.post("/all-doctors", authAdmin, allDoctors);

/**
 * @route POST /change-availability
 * @desc Change doctor availability (requires admin authentication)
 * @access Protected
 */
adminRouter.post("/change-availability", authAdmin, changeAvailability);

/**
 * @route GET /appointments
 * @desc Get all appointments (requires admin authentication)
 * @access Protected
 */
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);

/**
 * @route POST /cancel-appointment
 * @desc Cancel an appointment (requires admin authentication)
 * @access Protected
 */
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);

/**
 * @route GET /dashboard
 * @desc Get admin dashboard data (requires admin authentication)
 * @access Protected
 */
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;
