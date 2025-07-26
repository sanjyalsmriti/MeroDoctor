/**
 * Mongoose schema for user records.
 * Represents a user profile, including authentication, personal, and contact details.
 *
 * @module models/userModel
 */
import mongoose from "mongoose";

/**
 * User schema definition.
 * @typedef {Object} User
 * @property {string} name - User's full name.
 * @property {string} email - User's email address (unique).
 * @property {string} password - Hashed password for authentication.
 * @property {string} image - URL to the user's profile image.
 * @property {Object} address - Address object for the user (with line1, line2).
 * @property {string} gender - User's gender.
 * @property {Date|null} dob - User's date of birth.
 * @property {string} phone - User's phone number.
 */

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  address: {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  gender: { type: String, default: "Not selected" },
  dob: { type: Date, default: null },
  phone: { type: String, default: "0000000000" },
});

const User = mongoose.model("User", userSchema);

export default User;
