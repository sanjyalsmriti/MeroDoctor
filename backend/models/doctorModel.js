/**
 * Mongoose schema for doctor records.
 * Represents a doctor profile, including personal, professional, and availability details.
 *
 * @module models/doctorModel
 */
import mongoose from "mongoose";

/**
 * Doctor schema definition.
 * @typedef {Object} Doctor
 * @property {string} name - Doctor's full name.
 * @property {string} email - Doctor's email address (unique).
 * @property {string} password - Hashed password for authentication.
 * @property {string} image - URL to the doctor's profile image.
 * @property {string} speciality - Medical speciality of the doctor.
 * @property {string} degree - Doctor's degree or qualification.
 * @property {string} experience - Years or description of experience.
 * @property {string} about - About or bio of the doctor.
 * @property {boolean} available - Whether the doctor is currently available for appointments.
 * @property {number} fees - Appointment fee for the doctor.
 * @property {Object} address - Address object for the doctor.
 * @property {Date} date - Date the doctor profile was created.
 * @property {Object} slot_booked - Object mapping dates to booked time slots.
 */

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  speciality: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  about: { type: String, required: true },
  available: { type: Boolean, default: true },
  fees: { type: Number, required: true },
  address: { type: Object, required: true },
  date: { type: Date, default: Date.now },
  slot_booked: { type: Object, default: {} },
});

const Doctor = mongoose.model.Doctor || mongoose.model("Doctor", doctorSchema);

export default Doctor;
