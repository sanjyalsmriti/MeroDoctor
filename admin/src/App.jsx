/**
 * Main App component for the admin panel.
 * Handles authentication, layout, and routing for admin features.
 *
 * @module App
 */

import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from "./context/AdminContext";
import { useContext } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllApointments";
import DoctorsList from "./pages/Admin/DoctorsList";
import ContactMessages from "./pages/Admin/ContactMessages";
import { DoctorContext } from "./context/DoctorContext";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard.jsx";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments.jsx";
import DoctorProfile from "./pages/Doctor/DoctorProfile.jsx";

/**
 * Renders the admin panel UI if authenticated, otherwise shows the login page.
 *
 * @returns {JSX.Element} The rendered admin app UI.
 */

const App = () => {
  const { token } = useContext(AdminContext);
  const { dtoken } = useContext(DoctorContext);

  // Determine which dashboard to redirect to based on authentication
  const getDefaultRoute = () => {
    if (token) return "/admin-dashboard";
    if (dtoken) return "/doctor-dashboard";
    return "/admin-dashboard"; // fallback
  };

  return token || dtoken ? (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen">
          <Routes>
            { /* Admin Routes */}
            <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/admin-appointments" element={<AllAppointments />} />
            <Route path="/doctor-list" element={<DoctorsList />} />
            <Route path="/contact-messages" element={<ContactMessages />} />
            {/* Doctor Routes */}
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor-appointments" element={<DoctorAppointments />} />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
