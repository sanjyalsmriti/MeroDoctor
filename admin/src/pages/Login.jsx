import axios from "axios";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
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
  const { loginDoctor } = useContext(DoctorContext);
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
      } else {
        const result = await loginDoctor(email, password);
        if (!result.success) {
          toast.error(result.message || "Login failed");
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {state} Login
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Welcome back! Please sign in to your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="px-8 py-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Sign In
            </button>

            {/* Role Toggle */}
            <div className="text-center">
              {state === "Admin" ? (
                <p className="text-sm text-gray-600">
                  Are you a doctor?{" "}
                  <button
                    type="button"
                    onClick={() => setState("Doctor")}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Sign in as Doctor
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Are you an admin?{" "}
                  <button
                    type="button"
                    onClick={() => setState("Admin")}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Sign in as Admin
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 MERO Doctor. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
