// controllers/appointmentController.js
const Appointment = require("../models/appointmentModel");

const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate } = req.body;
    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: req.user._id,
      appointmentDate,
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400);
    throw new Error("Invalid appointment data");
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate("doctor")
      .sort("-createdAt");
    res.json(appointments);
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching appointments");
  }
};
