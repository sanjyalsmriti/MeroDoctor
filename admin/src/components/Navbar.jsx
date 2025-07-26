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

const Navbar = () => {
  const { token, setToken } = useContext(AdminContext);

  /**
   * Handles logout by clearing the token from context and localStorage.
   */
  const logoutHandler = () => {
    token && setToken(null);
    token && localStorage.removeItem("token");
  };
  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <img className="w-36 sm:w-40 cursor-pointer" src={assets.logo} alt="" />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {token ? "Admin" : "Doctor"}
        </p>
      </div>
      <button
        className="bg-primary text-white text-sm px-10 py-2 rounded-full"
        onClick={logoutHandler}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
