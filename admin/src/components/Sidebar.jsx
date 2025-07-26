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
import { assets } from "../assets/assets";

const Sidebar = () => {
  const { token } = useContext(AdminContext);

  return (
    <div className="min-h-screen bg-white border-r">
      {token && (
        <ul className="text-[#515151] mt-5">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-5 border-primary" : ""
              }`
            }
            to={"/admin-dashboard"}
          >
            <img src={assets.home_icon} alt="" />
            Dashboard
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-5 border-primary" : ""
              }`
            }
            to={"/admin-appointments"}
          >
            <img src={assets.appointment_icon} alt="" />
            Appointments
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-5 border-primary" : ""
              }`
            }
            to={"/add-doctor"}
          >
            <img src={assets.add_icon} alt="" />
            Add Doctor
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-5 border-primary" : ""
              }`
            }
            to={"/doctor-list"}
          >
            <img src={assets.people_icon} alt="" />
            Doctor List
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
