/**
 * Controller for doctor-related operations.
 * @module controllers/doctorController
 */
import Doctor from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
/**
 * Toggle the availability status of a doctor.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const changeAvailability = async (req, res) => {
  try {
    const { doctId } = req.body;
    const docData = await Doctor.findById(doctId);
    console.log("Doctor Data:", docData);
    await Doctor.findByIdAndUpdate(doctId, {
      available: !docData.available,
    });
    res.json({
      success: true,
      message: "Doctor availability changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Get a list of all doctors (excluding passwords).
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const doctorList = async (req, res) => {
  try {
    // Exclude password only, include email in the response
    const doctors = await Doctor.find({}).select("-password");
    res.json({
      success: true,
      doctors: doctors,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, doctor.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
    res.json({
      success: true,
      message: "Login successful",
      token,
      doctorId: doctor._id,
      doctor: {
        name: doctor.name,
        email: doctor.email,
        speciality: doctor.speciality,
        image: doctor.image,
      },
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Api for doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    // Get current date for filtering
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all appointments for the doctor
    const appointments = await appointmentModel
      .find({ docId })
      .sort({ date: -1 });

    // Calculate statistics
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(
      (apt) => !apt.cancelled && !apt.isCompleted
    ).length;
    const completedAppointments = appointments.filter(
      (apt) => apt.isCompleted
    ).length;
    const cancelledAppointments = appointments.filter(
      (apt) => apt.cancelled
    ).length;

    // Calculate monthly statistics
    const monthlyAppointments = appointments.filter(
      (apt) => apt.date >= currentMonth
    ).length;
    const monthlyRevenue = appointments
      .filter((apt) => apt.date >= currentMonth && apt.payment)
      .reduce((sum, apt) => sum + apt.amount, 0);

    // Get appointment statistics by status
    const appointmentStats = {
      total: totalAppointments,
      pending: pendingAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      monthly: monthlyAppointments,
      monthlyRevenue: monthlyRevenue,
    };

    res.json({
      success: true,
      appointments,
      appointmentStats,
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Api for getting doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Api for updating doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email; // Email should be updated separately for security

    const doctor = await Doctor.findByIdAndUpdate(doctorId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      doctor,
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList,
  doctorLogin,
  appointmentsDoctor,
  getDoctorProfile,
  updateDoctorProfile,
};
