/**
 * Controller for admin-related operations.
 * @module controllers/adminController
 */
import Doctor from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import User from "../models/userModel.js";
import Payment from "../models/paymentModel.js";
import Contact from "../models/contactModel.js";

/**
 * Add a new doctor to the system.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;
    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }
    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: "MeroDoctor",
    });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: new Date(),
    };
    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }
    // Create new doctor
    const newDoctor = await Doctor.create(doctorData);
    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      doctor: newDoctor,
    });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Admin login endpoint.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const adminLogin = async (req, res) => {
  debugger;
  try {
    const { email, password } = req.body;
    console.log("Admin login attempt:", process.env.ADMIN_EMAIL);
    console.log("Admin login attempt:", process.env.ADMIN_PASSWORD);
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all doctors for the admin panel.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const allDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select("-password");
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all appointments for the admin panel.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Cancel an appointment by admin.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);

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
 * Update an existing doctor's information.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const updateDoctor = async (req, res) => {
  try {
    const { doctId } = req.params;
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // Validate required fields
    if (
      !name ||
      !email ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required except password and image" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    // Check if doctor exists
    const existingDoctor = await Doctor.findById(doctId);
    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if email is already taken by another doctor
    const emailExists = await Doctor.findOne({ 
      email, 
      _id: { $ne: doctId } 
    });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email is already taken by another doctor",
      });
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      speciality,
      degree,
      experience,
      about,
      fees: Number(fees),
      address: JSON.parse(address),
    };

    // Handle password update if provided
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }

    // Handle image update if provided
    if (imageFile) {
      // Delete old image from cloudinary if it exists
      if (existingDoctor.image) {
        try {
          const publicId = existingDoctor.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      // Upload new image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "MeroDoctor",
      });
      updateData.image = imageUpload.secure_url;
    }

    // Update doctor
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get dashboard data for the admin panel.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const adminDashboard = async (req, res) => {
  try {
    // Get current date and calculate date ranges
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all data
    const doctors = await Doctor.find({}).select("-password");
    const users = await User.find({});
    const appointments = await appointmentModel.find({});
    const payments = await Payment.find({ status: "COMPLETE" });
    const contacts = await Contact.find({});

    // Calculate statistics
    const totalDoctors = doctors.length;
    const totalAppointments = appointments.length;
    const totalPatients = users.length;
    const totalContacts = contacts.length;
    const newContacts = contacts.filter(contact => contact.status === 'NEW').length;
    
    // Calculate revenue
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const monthlyRevenue = payments
      .filter(payment => payment.createdAt >= currentMonth)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const lastMonthRevenue = payments
      .filter(payment => payment.createdAt >= lastMonth && payment.createdAt < currentMonth)
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate appointment statistics
    const pendingAppointments = appointments.filter(apt => !apt.cancelled && !apt.isCompleted).length;
    const completedAppointments = appointments.filter(apt => apt.isCompleted).length;
    const cancelledAppointments = appointments.filter(apt => apt.cancelled).length;

    // Calculate growth percentages
    const currentMonthAppointments = appointments.filter(apt => apt.date >= currentMonth).length;
    const lastMonthAppointments = appointments.filter(apt => apt.date >= lastMonth && apt.date < currentMonth).length;
    const appointmentGrowth = lastMonthAppointments > 0 ? ((currentMonthAppointments - lastMonthAppointments) / lastMonthAppointments * 100).toFixed(1) : 0;

    const currentMonthPatients = users.filter(user => user.date >= currentMonth).length;
    const lastMonthPatients = users.filter(user => user.date >= lastMonth && user.date < currentMonth).length;
    const patientGrowth = lastMonthPatients > 0 ? ((currentMonthPatients - lastMonthPatients) / lastMonthPatients * 100).toFixed(1) : 0;

    const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

    // Get weekly appointment trends (last 7 days)
    const weeklyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const dayAppointments = appointments.filter(apt => 
        apt.date >= dayStart && apt.date < dayEnd
      ).length;
      
      weeklyTrends.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayAppointments
      });
    }

    // Get top performing doctors (by appointment count)
    const doctorPerformance = doctors.map(doctor => {
      const doctorAppointments = appointments.filter(apt => apt.docId === doctor._id.toString());
      const completedCount = doctorAppointments.filter(apt => apt.isCompleted).length;
      const totalCount = doctorAppointments.length;
      const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      return {
        _id: doctor._id,
        name: doctor.name,
        speciality: doctor.speciality,
        image: doctor.image,
        totalAppointments: totalCount,
        completedAppointments: completedCount,
        completionRate: completionRate
      };
    }).sort((a, b) => b.totalAppointments - a.totalAppointments).slice(0, 5);

    // Get latest appointments with populated data
    const latestAppointments = appointments
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(apt => ({
        _id: apt._id,
        slotDate: apt.slotDate,
        slotTime: apt.slotTime,
        amount: apt.amount,
        cancelled: apt.cancelled,
        isCompleted: apt.isCompleted,
        date: apt.date,
        userData: apt.userData,
        docData: apt.docData
      }));

    const dashboardData = {
      // Basic counts
      doctors: totalDoctors,
      appointments: totalAppointments,
      patients: totalPatients,
      contacts: {
        total: totalContacts,
        new: newContacts
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        growth: revenueGrowth
      },
      
      // Appointment status counts
      appointmentStats: {
        pending: pendingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments
      },
      
      // Growth percentages
      growth: {
        appointments: appointmentGrowth,
        patients: patientGrowth,
        revenue: revenueGrowth
      },
      
      // Trends and analytics
      weeklyTrends: weeklyTrends,
      topDoctors: doctorPerformance,
      latestAppointments: latestAppointments
    };

    res.status(200).json({ success: true, dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  addDoctor,
  adminLogin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  updateDoctor,
};
