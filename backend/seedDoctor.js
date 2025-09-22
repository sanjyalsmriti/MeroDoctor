/**
 * Seed script to add a test doctor to the database.
 * This script creates a test doctor account for development and testing purposes.
 *
 * @module seedDoctor
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";
import Doctor from "./models/doctorModel.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/MeroDoctor";

/**
 * Connects to MongoDB database
 */
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

/**
 * Creates a test doctor account
 */
const createTestDoctor = async () => {
  try {
    // Check if test doctor already exists
    const existingDoctor = await Doctor.findOne({ email: "doctor@test.com" });

    if (existingDoctor) {
      console.log("Test doctor already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("doctor123", 10);

    // Create test doctor
    const testDoctor = new Doctor({
      name: "Dr. John Smith",
      email: "doctor@test.com",
      password: hashedPassword,
      image: "https://via.placeholder.com/150x150?text=Doctor",
      speciality: "ENT",
      degree: "MBBS, MD (ENT)",
      experience: "15 years",
      about:
        "Experienced ENT with expertise in interventional cardiology and preventive care. Committed to providing the highest quality patient care.",
      available: true,
      fees: 150,
      address: {
        street: "123 Medical Center Dr",
        city: "New York",
        state: "NY",
        zipCode: "10001",
      },
    });

    await testDoctor.save();
    console.log("Test doctor created successfully");
    console.log("Email: doctor@test.com");
    console.log("Password: doctor123");
  } catch (error) {
    console.error("Error creating test doctor:", error);
  }
};

/**
 * Main function to run the seed script
 */
const main = async () => {
  await connectDB();
  await createTestDoctor();
  mongoose.connection.close();
  console.log("Seed script completed");
};

// Run the script
main().catch(console.error);
