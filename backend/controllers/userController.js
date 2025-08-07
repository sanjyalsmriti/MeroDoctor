/**
 * Controller for user-related operations.
 * Handles user registration, authentication, profile management, appointment booking, and payment details.
 *
 * @module controllers/userController
 */
import bcrypt from "bcrypt";
import validator from "validator";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import Doctor from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import Payment from "../models/paymentModel.js";
import ngramSearch from "../utils/ngramSearch.js";
import patientMatcher from "../utils/patientMatcher.js";

/**
 * Registers a new user.
 * - Validates input fields and email format.
 * - Hashes the password before saving.
 * - Returns a JWT token on successful registration.
 *
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects name, email, password in body)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };
    const newUser = new User(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Authenticates a user and returns a JWT token.
 * - Validates credentials and email format.
 * - Compares password hash.
 *
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects email, password in body)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Retrieves the profile of a user by userId.
 *
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects userId in body)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await User.findById(userId).select("-password");

    res.json({
      success: true,
      userData,
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Updates the profile of a user.
 * - Handles image upload if provided.
 * - Validates and parses address.
 *
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects userId, name, phone, address, dob, gender, and optionally image file in body)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !address || !dob || !gender) {
      return res.json({ success: false, message: "All fields are required" });
    }

    let addressObj = address;
    if (typeof address === "string") {
      try {
        addressObj = JSON.parse(address);
      } catch (e) {
        return res.json({ success: false, message: "Invalid address format" });
      }
    }

    const updatedData = {
      name,
      phone,
      address: addressObj,
      dob,
      gender,
    };

    await User.findByIdAndUpdate(userId, updatedData);
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      await User.findByIdAndUpdate(userId, {
        image: imageUrl,
      });
    }
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Books an appointment for a user with a doctor.
 * - Checks doctor availability and slot.
 * - Updates doctor's slot_booked.
 * - Creates a new appointment record.
 *
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects userId, docId, slotDate, slotTime in body)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await Doctor.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor is not available" });
    }
    let slot_booked = docData.slot_booked;

    if (slot_booked[slotDate]) {
      if (slot_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot already booked" });
      } else {
        slot_booked[slotDate].push(slotTime);
      }
    } else {
      slot_booked[slotDate] = [];
      slot_booked[slotDate].push(slotTime);
    }
    const userData = await User.findById(userId).select("-password");
    // Fix: use correct field name and ensure docData and amount are set
    const appointmentData = {
      userId,
      docId,
      userData,
      docData: docData, // fix: use correct field name for appointment model
      amount: docData.fees, // fix: use correct field name from doctor model
      slotTime,
      slotDate: new Date(slotDate.split("_").reverse().join("-")), // fix: convert '12_6_2025' to Date
      date: new Date(),
    };
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await Doctor.findByIdAndUpdate(docId, {
      slot_booked: { ...slot_booked }, // ensure a plain object is passed
    });
    res.json({
      success: true,
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error in bookAppointment:", error);
    res.json({ success: false, message: "Server error" });
  }
};

/**
 * Lists all appointments for a user.
 *
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects userId in body)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const listAppointments = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });
    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server error" });
  }
};

/**
 * Cancels a user's appointment and releases the booked slot.
 * - Checks user authorization.
 * - Updates appointment and doctor's slot_booked.
 *
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects userId, appointmentId in body)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releaseing doctor slot

    const { docId, slotDate, slotTime } = appointment;

    const doctorData = await Doctor.findById(docId);

    // Convert slotDate (Date object) to '12_6_2025' format
    const dateObj = new Date(slotDate);
    const formattedSlotDate = `${dateObj.getDate()}_${
      dateObj.getMonth() + 1
    }_${dateObj.getFullYear()}`;

    let slot_booked = doctorData.slot_booked;

    slot_booked[formattedSlotDate] = slot_booked[formattedSlotDate].filter(
      (el) => el !== slotTime
    );

    await Doctor.findByIdAndUpdate(docId, { slot_booked });

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error in cancelAppointment:", error);
    res.json({ success: false, message: "Server error" });
  }
};

/**
 * Retrieves payment details by transaction UUID.
 *
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects transaction_uuid in body)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const getPaymentDetails = async (req, res) => {
  try {
    const { transaction_uuid } = req.body;
    const payment = await Payment.findOne({ transaction_uuid });

    if (!payment) {
      return res.json({ success: false, message: "Payment not found" });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Error in getPaymentDetails:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Search doctors using N-gram algorithm
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const searchDoctorsWithNgrams = async (req, res) => {
  try {
    const { query, filters = {}, limit = 20 } = req.body;

    if (!query) {
      return res.json({ success: false, message: "Search query is required" });
    }

    const searchResults = await ngramSearch.searchDoctors(query, filters, limit);

    res.json({
      success: true,
      results: searchResults,
      totalResults: searchResults.length,
      searchQuery: query
    });

  } catch (error) {
    console.error("Error in searchDoctorsWithNgrams:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get search suggestions using N-grams
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const getNgramSearchSuggestions = async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;

    if (!query) {
      return res.json({ success: false, message: "Query parameter required" });
    }

    const suggestions = await ngramSearch.getSearchSuggestions(query, limit);

    res.json({
      success: true,
      suggestions,
      query
    });

  } catch (error) {
    console.error("Error in getNgramSearchSuggestions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Match patient with doctors using N-gram algorithm
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const matchPatientWithDoctors = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symptoms = {}, additionalCriteria = {}, limit = 10 } = req.body;

    const matchedDoctors = await patientMatcher.matchPatientWithDoctors(
      userId,
      symptoms,
      additionalCriteria,
      limit
    );

    res.json({
      success: true,
      matchedDoctors,
      totalMatches: matchedDoctors.length,
      patientId: userId
    });

  } catch (error) {
    console.error("Error in matchPatientWithDoctors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Find similar doctors using N-gram similarity
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const findSimilarDoctors = async (req, res) => {
  try {
    const { doctorId, limit = 5 } = req.body;

    if (!doctorId) {
      return res.json({ success: false, message: "Doctor ID is required" });
    }

    const similarDoctors = await ngramSearch.findSimilarDoctors(doctorId, limit);

    res.json({
      success: true,
      similarDoctors,
      referenceDoctorId: doctorId
    });

  } catch (error) {
    console.error("Error in findSimilarDoctors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get N-gram search statistics
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const getNgramStatistics = async (req, res) => {
  try {
    const stats = ngramSearch.getNgramStatistics();

    res.json({
      success: true,
      statistics: stats
    });

  } catch (error) {
    console.error("Error in getNgramStatistics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get similar patients for a doctor
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const getSimilarPatients = async (req, res) => {
  try {
    const { doctorId, limit = 5 } = req.body;

    if (!doctorId) {
      return res.json({ success: false, message: "Doctor ID is required" });
    }

    const similarPatients = await patientMatcher.getSimilarPatients(doctorId, limit);

    res.json({
      success: true,
      similarPatients,
      doctorId
    });

  } catch (error) {
    console.error("Error in getSimilarPatients:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
  getPaymentDetails,
  searchDoctorsWithNgrams,
  getNgramSearchSuggestions,
  matchPatientWithDoctors,
  findSimilarDoctors,
  getNgramStatistics,
  getSimilarPatients,
};
