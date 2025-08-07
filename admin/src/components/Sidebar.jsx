/**
 * Sidebar component for the admin panel.
 * Renders navigation links for dashboard, appointments, doctor management, and more.
 *
 * - Uses React Router's NavLink for navigation and active state styling.
 * - Displays only when the admin is authenticated (token present).
 * - Uses Tailwind CSS for layout and responsive design.
 * - Shows icons for each navigation item from the assets module.
 *
 * @component
 * @returns {JSX.Element} The rendered Sidebar component.
 */
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";

const Sidebar = () => {
  const { token } = useContext(AdminContext);
  const { dtoken } = useContext(DoctorContext);

  return (
    <div className="w-64 min-h-screen admin-sidebar border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-warm rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">
            {token ? "Admin" : "Doctor"} Panel
          </h2>
        </div>
        
        <nav className="space-y-2">
          {token && (
            <>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-white/20 backdrop-blur-sm text-white border-r-2 border-white" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
                to={"/admin-dashboard"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                Dashboard
              </NavLink>
              
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-white/20 backdrop-blur-sm text-white border-r-2 border-white" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
                to={"/admin-appointments"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Appointments
              </NavLink>

              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-white/20 backdrop-blur-sm text-white border-r-2 border-white" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
                to={"/doctor-list"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Doctor List
              </NavLink>

              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-white/20 backdrop-blur-sm text-white border-r-2 border-white" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
                to={"/contact-messages"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Messages
              </NavLink>
            </>
          )}
          
          {dtoken && (
            <>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-white/20 backdrop-blur-sm text-white border-r-2 border-white" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
                to={"/doctor-dashboard"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                Dashboard
              </NavLink>
              
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-white/20 backdrop-blur-sm text-white border-r-2 border-white" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
                to={"/doctor-appointments"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Appointments
              </NavLink>

              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-white/20 backdrop-blur-sm text-white border-r-2 border-white" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
                to={"/doctor-profile"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
