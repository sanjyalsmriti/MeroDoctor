/**
 * Mongoose schema for payment records.
 * Represents a payment transaction, including eSewa integration details, status, and references to appointments and users.
 *
 * @module models/paymentModel
 */
import mongoose from "mongoose";

/**
 * Payment schema definition.
 * @typedef {Object} Payment
 * @property {number} amount - The base amount for the payment.
 * @property {number} product_delivery_charge - Delivery charge for the product/service.
 * @property {number} product_service_charge - Service charge for the product/service.
 * @property {string} product_code - Product code used for eSewa integration.
 * @property {string} signature - HMAC signature for eSewa verification.
 * @property {number} tax_amount - Tax amount included in the payment.
 * @property {string} total_amount - Total amount (base + tax + charges).
 * @property {string} transaction_uuid - Unique transaction identifier for the payment.
 * @property {string} signed_field_names - Comma-separated list of signed fields for eSewa.
 * @property {string} status - Payment status (e.g., PENDING, COMPLETE, FAILED).
 * @property {Object} user - User data snapshot at the time of payment.
 * @property {string} [ref_id] - Reference ID returned by eSewa after payment verification.
 * @property {string} [transaction_code] - Transaction code from eSewa.
 * @property {string} [esewa_signature] - Signature returned by eSewa after verification.
 * @property {mongoose.Types.ObjectId} appointmentId - Reference to the related appointment.
 * @property {Date} createdAt - Timestamp when the payment was created.
 * @property {Date} updatedAt - Timestamp when the payment was last updated.
 */

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  product_delivery_charge: { type: Number, required: true },
  product_service_charge: { type: Number, required: true },
  product_code: { type: String, required: true },
  signature: { type: String, required: true },
  tax_amount: { type: Number, required: true },
  total_amount: { type: String, required: true },
  transaction_uuid: { type: String, required: true },
  signed_field_names: { type: String, required: true },
  status: { type: String, required: true },
  user: { type: Object, required: true },
  ref_id: { type: String, default: "" },
  transaction_code: { type: String, default: "" },
  esewa_signature: { type: String, default: "" },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;
