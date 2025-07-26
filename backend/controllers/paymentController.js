/**
 * Controller for payment and eSewa integration operations.
 * Handles payment initiation, verification, and status updates for appointments.
 *
 * @module controllers/paymentController
 */
import crypto from "crypto";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Payment from "../models/paymentModel.js";
import appointmentModel from "../models/appointmentModel.js";

const ESEWA_PRODUCT_CODE = "EPAYTEST";
const ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q";
const ESEWA_BASE_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

/**
 * Initiates an eSewa payment instance and returns the payment form data to the frontend.
 * - Generates a unique transaction UUID if not provided.
 * - Calculates the total amount (amount + tax_amount).
 * - Generates a base64 HMAC-SHA256 signature as required by eSewa.
 * - Stores a new Payment record in the database with status 'PENDING'.
 * - Returns the eSewa payment URL and form data for client-side redirection.
 *
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects amount, tax_amount, product_service_charge, product_delivery_charge, transaction_uuid, userData, appointmentId in body)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const esewaInstance = async (req, res) => {
  try {
    const {
      amount = 0,
      tax_amount = 0,
      product_service_charge = 0,
      product_delivery_charge = 0,
      transaction_uuid,
      userData = {},
      appointmentId,
    } = req.body;

    const totalAmount = Number(amount) + Number(tax_amount);
    const transactionUuid = transaction_uuid || uuidv4();
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const signature = Buffer.from(
      crypto.createHmac("sha256", ESEWA_SECRET_KEY).update(message).digest()
    ).toString("base64");

    const paymentData = {
      amount: String(amount),
      product_delivery_charge: String(product_delivery_charge),
      product_service_charge: String(product_service_charge),
      product_code: ESEWA_PRODUCT_CODE,
      signature,
      tax_amount: String(tax_amount),
      total_amount: String(totalAmount),
      transaction_uuid: transactionUuid,
      success_url: "http://localhost:4000/api/payment/esewa/success",
      failure_url: "http://localhost:4000/api/payment/esewa/failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
      appointmentId,
    };

    await Payment.create({
      ...paymentData,
      user: userData,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.json({
      esewaUrl: ESEWA_BASE_URL,
      paymentData,
    });
  } catch (error) {
    console.error("Error in esewaInstance:", error);
    res.status(500).json({ success: false, message: "Esewa instance error" });
  }
};

/**
 * Verifies the eSewa payment after user completes or cancels payment on eSewa.
 * - Decodes and parses the payment data from the query string.
 * - Calls eSewa's transaction status API to verify payment status.
 * - Updates the Payment record in the database with the verification result.
 * - If payment is successful, marks the related appointment as paid.
 * - Redirects the user to the frontend with payment status and transaction UUID.
 *
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects base64 encoded data in query)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const esewaVerification = async (req, res) => {
  try {
    const encodedData = req.query.data;
    const decodedData = Buffer.from(encodedData, "base64").toString("ascii");
    const data = JSON.parse(decodedData);
    const { product_code, total_amount, transaction_uuid } = data;
    const verificationResponse = await axios.get(
      "https://rc-epay.esewa.com.np/api/epay/transaction/status/",
      {
        params: { product_code, total_amount, transaction_uuid },
      }
    );
    // find transaction_uuid and update status and ref_id first find Payment and store in variable and then update
    const payment = await Payment.findOne({ transaction_uuid });
    if (payment) {
      // Update the payment record with the verification response
      await payment.updateOne({
        status: verificationResponse.data.status,
        ref_id: verificationResponse.data.ref_id || "",
        transaction_code: data.transaction_code || "",
        esewa_signature: data.signature || "",
        updatedAt: new Date(),
      });
      await appointmentModel.updateOne(
        { _id: payment.appointmentId },
        { payment: true }
      );
    }
    if (verificationResponse.data.status === "COMPLETE") {
      // TODO: Update your database (e.g., mark order as paid)
      console.log("Payment successful:", data);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?status=success&uuid=${transaction_uuid}`
      );
    } else {
      console.log("Payment status not complete:", verificationResponse.data);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failure?status=failed&uuid=${transaction_uuid}`
      );
    }
  } catch (error) {
    console.error("Error verifying eSewa payment:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failure?status=error`
    );
  }
};

/**
 * Handles the eSewa success callback.
 * - Delegates to esewaVerification to process and redirect appropriately.
 *
 * @function
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const esewaSuccess = (req, res) => {
  return esewaVerification(req, res);
};

/**
 * Handles the eSewa failure callback.
 * - Delegates to esewaVerification to process and redirect appropriately.
 *
 * @function
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const esewaFailure = (req, res) => {
  return esewaVerification(req, res);
};

export { esewaInstance, esewaVerification, esewaSuccess, esewaFailure };
