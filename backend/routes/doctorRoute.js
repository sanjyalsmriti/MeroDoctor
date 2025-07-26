/**
 * Express router for doctor-related API endpoints.
 * Handles routes for retrieving doctor lists and related operations.
 *
 * @module routes/doctorRoute
 */
import express from "express";
import { doctorList } from "../controllers/doctorController.js";

const doctorRouter = express.Router();

/**
 * @route GET /list
 * @desc Get a list of all doctors (excluding passwords)
 * @access Public
 */
doctorRouter.get("/list", doctorList);

export default doctorRouter;
