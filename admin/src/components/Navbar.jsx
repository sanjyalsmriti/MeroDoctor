/**
 * Navbar component for the admin panel.
 * Displays the application logo, user role, and logout button.
 *
 * - Shows the admin logo and role ("Admin" if logged in, otherwise "Doctor").
 * - Provides a logout button that clears the token from context and localStorage.
 * - Uses Tailwind CSS for styling and responsive layout.
 *
 * @component
 * @returns {JSX.Element} The rendered Navbar component.
 */
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { assets } from "../assets/assets";
import { DoctorContext } from "../context/DoctorContext";

const Navbar = () => {
  const { token, setToken } = useContext(AdminContext);
  const { dtoken, logoutDoctor } = useContext(DoctorContext);

  /**
   * Handles logout by clearing the token from context and localStorage.
   */
  const logoutHandler = () => {
    if (token) {
      setToken(null);
      localStorage.removeItem("token");
    } else if (dtoken) {
      logoutDoctor();
    }
  };

  const userRole = token ? "Admin" : "Doctor";
  const userEmail = token ? localStorage.getItem("adminEmail") : localStorage.getItem("doctorEmail") || "doctor@test.com";

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <img className="w-32 h-8 object-contain" src={assets.logo} alt="MERO Doctor" />
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm font-medium text-gray-700">{userRole} Panel</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userRole.charAt(0)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userRole}</p>
                <p className="text-xs text-gray-500">{userEmail || "user@example.com"}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={logoutHandler}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
