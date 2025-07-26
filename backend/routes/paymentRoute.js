/**
 * Express router for payment and eSewa integration API endpoints.
 * Handles routes for payment initiation, verification, and status callbacks.
 *
 * @module routes/paymentRoute
 */
import express from "express";
import {
  esewaInstance,
  esewaVerification,
  esewaSuccess,
  esewaFailure,
} from "../controllers/paymentController.js";
const paymentRouter = express.Router();

/**
 * @route POST /esewa/initiate-payment
 * @desc Initiate an eSewa payment and return payment form data
 * @access Public
 */
paymentRouter.post("/esewa/initiate-payment", esewaInstance);

/**
 * @route GET /esewa/esewaVerification
 * @desc Verify eSewa payment status after user completes/cancels payment
 * @access Public
 */
paymentRouter.get("/esewa/esewaVerification", esewaVerification);

/**
 * @route GET /esewa/success
 * @desc Handle eSewa payment success callback and redirect
 * @access Public
 */
paymentRouter.get("/esewa/success", esewaSuccess);

/**
 * @route GET /esewa/failure
 * @desc Handle eSewa payment failure callback and redirect
 * @access Public
 */
paymentRouter.get("/esewa/failure", esewaFailure);

export default paymentRouter;
