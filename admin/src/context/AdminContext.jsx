/**
 * React context for admin-related state and actions in the admin panel.
 * Provides authentication, doctor management, and utility functions to child components.
 *
 * @module AdminContext
 */

import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
export const AdminContext = createContext();

/**
 * Context object for admin features.
 * @type {import('react').Context<any>}
 */

const AdminContextProvider = (props) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState({});

  /**
   * Backend API base URL for admin requests.
   * @type {string}
   */

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  /**
   * Fetches all doctors from the backend and updates state.
   * Shows a toast notification on error or failure.
   *
   * @async
   * @function getAllDoctors
   * @returns {Promise<void>}
   */

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/all-doctors`,
        {},
        {
          headers: {
            token,
          },
        }
      );
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message || "Failed to fetch doctors");
      }
    } catch (error) {
      toast.error("Error fetching doctors");
      console.error("Error fetching doctors:", error);
    }
  };
  /**
   * Changes the availability status of a doctor by ID.
   * Refreshes the doctor list on success.
   * Shows a toast notification on error or failure.
   *
   * @async
   * @function changeAvailability
   * @param {string} doctId - The ID of the doctor to update
   * @returns {Promise<void>}
   */

  const changeAvailability = async (doctId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-availability`,
        { doctId },
        {
          headers: {
            token,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors(); // Refresh the list of doctors
      } else {
        toast.error(data.message || "Failed to change availability");
      }
    } catch (error) {
      toast.error("Error changing availability");
      console.error("Error changing availability:", error);
    }
  };
  /**
   * Fetches all appointments from the backend and updates state.
   * Shows a toast notification on error or failure.
   *
   * @async
   * @function getAllAppointments
   * @returns {Promise<void>}
   */

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, {
        headers: {
          token,
        },
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      toast.error("Error fetching appointments");
      console.error("Error fetching appointments:", error);
    }
  };
  /**
   * Cancels an appointment by ID.
   * Refreshes the appointments list on success.
   * Shows a toast notification on error or failure.
   *
   * @async
   * @function cancelAppointment
   * @param {string} appointmentId - The ID of the appointment to cancel
   * @returns {Promise<void>}
   */

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/cancel-appointment`,
        { appointmentId },
        {
          headers: {
            token,
          },
        }
      );
      if (data.success) {
        toast.success(data.message || "Appointment cancelled successfully");
        getAllAppointments(); // Refresh the appointments list
      } else {
        toast.error(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      toast.error("Error cancelling appointment");
      console.error("Error cancelling appointment:", error);
    }
  };
  /**
   * Fetches dashboard data from the backend and updates state.
   * Shows a toast notification on error or failure.
   *
   * @async
   * @function getDashboardData
   * @returns {Promise<void>}
   */

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: {
          token,
        },
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      toast.error("Error fetching dashboard data");
      console.error("Error fetching dashboard data:", error);
    }
  };

  /**
   * Value provided to AdminContext consumers.
   * @typedef {object} AdminContextValue
   * @property {string|null} token - Admin authentication token
   * @property {function} setToken - Setter for token
   * @property {string} backendUrl - Backend API base URL
   * @property {function} getAllDoctors - Fetches all doctors
   * @property {Array} doctors - List of doctor objects
   * @property {function} changeAvailability - Changes doctor availability
   */

  const value = {
    token,
    setToken,
    backendUrl,
    getAllDoctors,
    doctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    getDashboardData,
    dashboardData,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};
export default AdminContextProvider;
