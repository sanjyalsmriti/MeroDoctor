import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import PaymentButton from "../components/PaymentButton";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.log("Error fetching appointments:", error);
      toast.error(error.message || "Failed to fetch appointments");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        {
          headers: { token },
        }
      );

      if (data.success) {
        toast.success(data.message || "Appointment cancelled successfully");
        getUserAppointments(); // Refresh the appointments list
        getDoctorsData();
      } else {
        toast.error(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.message || "Failed to cancel appointment");
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    } else {
      toast.warn("Please login to view your appointments");
    }
  }, [token]);
  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>
      <div>
        {appointments.map((doctor, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={doctor.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {doctor.docData.name}
              </p>
              <p>{doctor.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address</p>
              <p className="text-xs">{doctor.docData.address.line1}</p>
              <p className="text-xs">{doctor.docData.address.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>
                {/* slotDate date only and in 22 Aug 2024 like format */}
                {new Date(doctor.slotDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                | {doctor.slotTime}
              </p>
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end">
              {!doctor.cancelled &&
                (!doctor.payment ? (
                  <PaymentButton
                    appointmentId={doctor._id}
                    amount={doctor.amount}
                  >
                    Pay Via Esewa
                  </PaymentButton>
                ) : (
                  <button
                    type="button"
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded bg-green-800 text-white hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Paid
                  </button>
                ))}
              {!doctor.cancelled && (
                <button
                  onClick={() => cancelAppointment(doctor._id)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel appointment
                </button>
              )}
              {doctor.cancelled && (
                <button className="text-sm text-red-500 text-center sm:min-w-48 py-2 border rounded">
                  Appointment Cancelled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
