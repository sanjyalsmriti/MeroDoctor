/**
 * AllAppointments page component for admin panel.
 * Displays a list of all appointments with patient, doctor, date, status, and actions.
 * Fetches appointments on mount and provides cancel functionality.
 *
 * @module pages/Admin/AllAppointments
 */

import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
const AllAppointments = () => {
  const { token, getAllAppointments, appointments, cancelAppointment } =
    useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  /**
   * useEffect hook to fetch all appointments when the token is available.
   *
   * @function
   * @returns {void}
   */
  useEffect(() => {
    if (token) {
      getAllAppointments();
    }
  }, [token]);

  /**
   * Renders the appointment list table with patient and doctor details, age, date, status, and cancel action.
   *
   * @returns {JSX.Element} The rendered appointment list UI.
   */
  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Status</p>
          <p>Action</p>
        </div>
        {appointments.map((appointment, index) => (
          <div
            key={appointment._id}
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={appointment.userData.image}
                alt=""
              />
              <p>{appointment.userData.name}</p>
            </div>
            <p className="max-sm:hidden">
              {calculateAge(appointment.userData.dob)}
            </p>
            <p>
              {slotDateFormat(appointment.date)}, {appointment.slotTime}
            </p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={appointment.docData.image}
                alt=""
              />
              <p>{appointment.docData.name}</p>
            </div>
            <p>
              {currency}
              {appointment.amount}
            </p>
            <p>{appointment.status}</p>
            <p>
              {appointment.cancelled ? (
                <span className="text-red-500">Cancelled</span>
              ) : (
                <img
                  onClick={() => cancelAppointment(appointment._id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                />
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
