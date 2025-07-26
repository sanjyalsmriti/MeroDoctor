/**
 * Controller for doctor-related operations.
 * @module controllers/doctorController
 */
import Doctor from "../models/doctorModel.js";

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

export { changeAvailability, doctorList };
