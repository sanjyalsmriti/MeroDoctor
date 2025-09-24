/**
 * Mongoose schema for appointment records.
 * Represents a booked appointment between a user and a doctor, including slot, payment, and status details.
 *
 * @module models/appointmentModel
 */
import mongoose from "mongoose";

/**
 * Appointment schema definition.
 * @typedef {Object} Appointment
 * @property {string} userId - The ID of the user who booked the appointment.
 * @property {string} docId - The ID of the doctor for the appointment.
 * @property {Date} slotDate - The date of the appointment slot.
 * @property {string} slotTime - The time of the appointment slot.
 * @property {Object} userData - The user data snapshot at the time of booking.
 * @property {Object} docdata - The doctor data snapshot at the time of booking.
 * @property {number} amount - The fee for the appointment.
 * @property {Date} date - The date the appointment was created.
 * @property {boolean} cancelled - Whether the appointment is cancelled.
 * @property {Object} payment - Payment details for the appointment.
 * @property {boolean} isCompleted - Whether the appointment is completed.
 */

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  docId: {
    type: String,
    required: true,
  },
  slotDate: {
    type: Date,
    required: true,
  },
  slotTime: {
    type: String,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
  docData: {
    type: Object,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  cancelled: {
    type: Boolean,
    default: false,
  },
  payment: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
