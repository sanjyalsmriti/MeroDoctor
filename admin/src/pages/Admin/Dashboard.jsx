/**
 * Dashboard page component for admin panel.
 * Displays summary statistics and latest bookings for doctors, appointments, and patients.
 * Fetches dashboard data on mount.
 *
 * @module pages/Admin/Dashboard
 */

import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { token, getDashboardData, dashboardData, cancelAppointment } =
    useContext(AdminContext);
  const { slotDateFormat, currency } = useContext(AppContext);

  /**
   * useEffect hook to fetch dashboard data when the token is available.
   *
   * @function
   * @returns {void}
   */
  useEffect(() => {
    if (token) {
      getDashboardData();
    }
  }, [token]);

  /**
   * Renders the dashboard summary cards and latest bookings list.
   *
   * @returns {JSX.Element|null} The rendered dashboard UI or null if no data.
   */
  return (
    dashboardData && (
      <div className="m-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img src={assets.doctor_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashboardData.doctors}
              </p>
              <p className="text-gray-500">Doctors</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img src={assets.appointment_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashboardData.appointments}
              </p>
              <p className="text-gray-500">Appointments</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img src={assets.patients_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashboardData.patients}
              </p>
              <p className="text-gray-500">Patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
            <img src={assets.list_icon} alt="" />
            <p className="font-semibold">Latest Bookings</p>
          </div>
          <div className="pt-4 border border-t-0">
            {dashboardData.latestAppointments?.map((booking, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b px-4"
              >
                <img
                  className="rounded-full w-10"
                  src={booking.docData.image}
                  alt=""
                />
                <div className="flex-1 ml-4">
                  <p>{booking.docData.name}</p>
                  <p className="text-gray-500">
                    {slotDateFormat(booking.slotDate)}
                  </p>
                </div>
                {booking.cancelled ? (
                  <span className="text-red-500 text-xs font-medium">
                    Cancelled
                  </span>
                ) : (
                  <p className="text-green-500">Confirmed</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
