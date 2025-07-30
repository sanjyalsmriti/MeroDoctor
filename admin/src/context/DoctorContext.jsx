/**
 * React context for doctor-related state and actions in the admin panel.
 * Intended to provide doctor-specific utilities and state to child components.
 *
 * @module DoctorContext
 */

import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

/**
 * Context object for doctor features.
 * @type {import('react').Context<any>}
 */
export const DoctorContext = createContext();

/**
 * DoctorContextProvider wraps the app and provides doctor state and actions via context.
 *
 * @component
 * @param {object} props - React props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The context provider with doctor state and actions.
 */
const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [dtoken, setdtoken] = useState(localStorage.getItem("dtoken") ? localStorage.getItem("dtoken") : "");
  const [appointments, setAppointments] = useState([]);
  const [appointmentStats, setAppointmentStats] = useState({});
  const [loading, setLoading] = useState(false);
  
  const getAppointments = async () => {
    setLoading(true);
    try {
      const doctorId = localStorage.getItem("doctorId");
      
      if (!doctorId) {
        toast.error("Doctor ID not found. Please login again.");
        return;
      }
      
      const { data } = await axios.post(`${backendUrl}/api/doctor/appointments`, {
        docId: doctorId
      }, {
        headers: { 
          dtoken: dtoken || "",
        },
      });
      
      if (data.success) {
        setAppointments(data.appointments);
        setAppointmentStats(data.appointmentStats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error.response?.data?.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };
  const loginDoctor = async (email, password) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/login`, {
        email,
        password
      });
      
      if (data.success) {
        setdtoken(data.token);
        localStorage.setItem("dtoken", data.token);
        localStorage.setItem("doctorId", data.doctorId || data.doctor._id); // Store doctor ID
        localStorage.setItem("doctorEmail", data.doctor.email); // Store doctor email
        localStorage.setItem("doctorInfo", JSON.stringify(data.doctor)); // Store full doctor info
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, message: "Login failed" };
    }
  };

  const logoutDoctor = () => {
    setdtoken("");
    setAppointments([]);
    setAppointmentStats({});
    localStorage.removeItem("dtoken");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("doctorEmail");
    localStorage.removeItem("doctorInfo");
  };

  const value = {
    dtoken,
    setdtoken,
    backendUrl,
    appointments,
    appointmentStats,
    loading,
    getAppointments,
    setAppointments,
    loginDoctor,
    logoutDoctor,

    // Define any state or functions you want to provide to the context
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

/**
 * Value provided to DoctorContext consumers.
 * @typedef {object} DoctorContextValue
 * // Define properties as you add them to the context value
 */

export default DoctorContextProvider;
