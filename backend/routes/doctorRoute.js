/**
 * Express router for doctor-related API endpoints.
 * Handles routes for retrieving doctor lists and related operations.
 *
 * @module routes/doctorRoute
 */
import express from "express";
import { doctorList, doctorLogin, appointmentsDoctor, getDoctorProfile, updateDoctorProfile } from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";
const doctorRouter = express.Router();

/**
 * @route GET /list
 * @desc Get a list of all doctors (excluding passwords)
 * @access Public
 */
doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", doctorLogin);
doctorRouter.post("/appointments", authDoctor, appointmentsDoctor);

// Profile management endpoints
doctorRouter.get("/profile/:doctorId", authDoctor, getDoctorProfile);
doctorRouter.put("/profile/:doctorId", authDoctor, updateDoctorProfile);

// Test endpoint for debugging (remove in production)
doctorRouter.post("/appointments-test", appointmentsDoctor);
export default doctorRouter;
