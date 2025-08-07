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
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, confirmed, pending, cancelled

  const getUserAppointments = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      setCancellingId(appointmentId);
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        {
          headers: { token },
        }
      );

      if (data.success) {
        toast.success(data.message || "Appointment cancelled successfully");
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.message || "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (appointment) => {
    if (appointment.cancelled) return "red";
    if (appointment.payment) return "green";
    return "yellow";
  };

  const getStatusText = (appointment) => {
    if (appointment.cancelled) return "Cancelled";
    if (appointment.payment) return "Confirmed";
    return "Pending Payment";
  };

  const getStatusIcon = (appointment) => {
    if (appointment.cancelled) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    if (appointment.payment) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'confirmed') return appointment.payment && !appointment.cancelled;
    if (filter === 'pending') return !appointment.payment && !appointment.cancelled;
    if (filter === 'cancelled') return appointment.cancelled;
    return true;
  });

  useEffect(() => {
    if (token) {
      getUserAppointments();
    } else {
      toast.warn("Please login to view your appointments");
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading your appointments...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 rounded-full text-blue-700 text-sm font-semibold mb-6 shadow-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Appointment Management
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            My <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Appointments</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Manage and track all your scheduled appointments with real-time updates and seamless interactions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { key: 'all', label: 'All', count: appointments.length },
            { key: 'confirmed', label: 'Confirmed', count: appointments.filter(apt => apt.payment && !apt.cancelled).length },
            { key: 'pending', label: 'Pending', count: appointments.filter(apt => !apt.payment && !apt.cancelled).length },
            { key: 'cancelled', label: 'Cancelled', count: appointments.filter(apt => apt.cancelled).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                filter === tab.key ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{appointments.length}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Confirmed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {appointments.filter(apt => apt.payment && !apt.cancelled).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {appointments.filter(apt => !apt.payment && !apt.cancelled).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Cancelled</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {appointments.filter(apt => apt.cancelled).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No appointments found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {filter === 'all' 
                ? "You haven't booked any appointments yet. Start by finding a doctor and scheduling your first consultation."
                : `No ${filter} appointments found. Try changing the filter or book a new appointment.`
              }
            </p>
            <button
              onClick={() => window.location.href = '/doctors'}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Find Doctors
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredAppointments.map((appointment, index) => (
              <div
                key={appointment._id}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Doctor Image */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
                          <img
                            className="w-full h-full object-cover"
                            src={appointment.docData.image}
                            alt={appointment.docData.name}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/128x128?text=Doctor";
                            }}
                          />
                        </div>
                        <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                          getStatusColor(appointment) === 'green' ? 'bg-green-500' :
                          getStatusColor(appointment) === 'red' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}>
                          {getStatusIcon(appointment)}
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {appointment.docData.name}
                            </h3>
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                              getStatusColor(appointment) === 'green' ? 'bg-green-100 text-green-800' :
                              getStatusColor(appointment) === 'red' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getStatusText(appointment)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-6 text-lg">{appointment.docData.speciality}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-2xl p-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Date & Time</p>
                              <p className="text-gray-800 font-medium">
                                {new Date(appointment.slotDate).toLocaleDateString("en-US", {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-blue-600 font-semibold">{appointment.slotTime}</p>
                            </div>
                            
                            <div className="bg-gray-50 rounded-2xl p-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Address</p>
                              <p className="text-gray-800">
                                {appointment.docData.address?.line1 || 'Address not available'}
                                {appointment.docData.address?.line2 && (
                                  <span className="block">{appointment.docData.address.line2}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 lg:items-end">
                          {!appointment.cancelled && !appointment.payment && (
                            <PaymentButton
                              appointmentId={appointment._id}
                              amount={appointment.amount}
                            >
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Pay NPR {appointment.amount}
                              </div>
                            </PaymentButton>
                          )}
                          
                          {!appointment.cancelled && appointment.payment && (
                            <div className="flex items-center gap-3 text-green-600 font-semibold bg-green-50 px-4 py-3 rounded-2xl">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Payment Complete
                            </div>
                          )}
                          
                          {!appointment.cancelled && (
                            <button
                              onClick={() => cancelAppointment(appointment._id)}
                              disabled={cancellingId === appointment._id}
                              className="flex items-center gap-3 px-6 py-3 text-red-600 border-2 border-red-200 rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                              {cancellingId === appointment._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Cancel Appointment
                                </>
                              )}
                            </button>
                          )}
                          
                          {appointment.cancelled && (
                            <div className="flex items-center gap-3 text-red-600 font-semibold bg-red-50 px-4 py-3 rounded-2xl">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Appointment Cancelled
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
