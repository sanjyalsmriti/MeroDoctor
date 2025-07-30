/**
 * Express router for contact form API endpoints.
 * Handles routes for contact form submissions and admin management.
 *
 * @module routes/contactRoute
 */
import express from "express";
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats
} from "../controllers/contactController.js";
import authAdmin from "../middlewares/authAdmin.js";

const contactRouter = express.Router();

/**
 * @route POST /submit
 * @desc Submit a new contact form message
 * @access Public
 */
contactRouter.post("/submit", submitContact);

/**
 * @route GET /admin/all
 * @desc Get all contact messages (requires admin authentication)
 * @access Protected
 */
contactRouter.get("/admin/all", authAdmin, getAllContacts);

/**
 * @route GET /admin/:id
 * @desc Get a single contact message by ID (requires admin authentication)
 * @access Protected
 */
contactRouter.get("/admin/:id", authAdmin, getContactById);

/**
 * @route PUT /admin/:id/status
 * @desc Update contact message status (requires admin authentication)
 * @access Protected
 */
contactRouter.put("/admin/:id/status", authAdmin, updateContactStatus);

/**
 * @route DELETE /admin/:id
 * @desc Delete a contact message (requires admin authentication)
 * @access Protected
 */
contactRouter.delete("/admin/:id", authAdmin, deleteContact);

/**
 * @route GET /admin/stats
 * @desc Get contact statistics for admin dashboard (requires admin authentication)
 * @access Protected
 */
contactRouter.get("/admin/stats", authAdmin, getContactStats);

export default contactRouter; 