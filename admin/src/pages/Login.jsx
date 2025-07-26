import axios from "axios";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";

/**
 * Login page component for admin panel.
 * Provides a login form for admin authentication and handles login logic.
 *
 * @module pages/Login
 */

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setToken, backendUrl } = useContext(AdminContext);
  /**
   * Handles the form submission for admin login.
   * Sends login credentials to backend and sets token on success.
   * Shows toast notifications for success or error.
   *
   * @async
   * @function onSubmitHandler
   * @param {React.FormEvent<HTMLFormElement>} event - The form submit event
   * @returns {Promise<void>}
   */
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === "Admin") {
        const { data } = await axios.post(backendUrl + "/api/admin/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        } else {
          toast.error(data.message || "Login failed");
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };
  return (
    <form className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full ">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            required
          />
        </div>
        <div className="w-full ">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="password"
            required
          />
        </div>
        <button
          onClick={onSubmitHandler}
          className="bg-primary text-white py-2 px-4 rounded py-2 w-full mt-4 "
        >
          Login
        </button>
      </div>
    </form>
  );
};

export default Login;
