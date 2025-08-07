/**
 * Dashboard page component for admin panel.
 * Displays summary statistics, charts, and latest bookings for doctors, appointments, and patients.
 * Features modern UI design with enhanced visualizations and responsive layout.
 *
 * @module pages/Admin/Dashboard
 */

import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { token, getDashboardData, dashboardData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  /**
   * useEffect hook to fetch dashboard data when the token is available.
   */
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  /**
   * Fetches dashboard data with loading state
   */
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await getDashboardData();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gets status text for appointments
   */
  const getStatusText = (cancelled, isCompleted) => {
    if (cancelled) return 'Cancelled';
    if (isCompleted) return 'Completed';
    return 'Pending';
  };

  /**
   * Gets status color for appointments
   */
  const getStatusColor = (cancelled, isCompleted) => {
    if (cancelled) return 'bg-red-100 text-red-800';
    if (isCompleted) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  /**
   * Formats currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
              currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Renders the dashboard summary cards and latest bookings list.
   */
  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto bg-gray-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 btn-primary rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && dashboardData && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Doctors Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Doctors</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.doctors}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Active and available
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <img src={assets.doctor_icon} alt="Doctors" className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Appointments Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.appointments}</p>

                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <img src={assets.appointment_icon} alt="Appointments" className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Patients Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.patients}</p>

                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <img src={assets.patients_icon} alt="Patients" className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(dashboardData.revenue?.monthly || 0)}
                  </p>

                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboardData.appointmentStats?.pending || 0}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardData.appointmentStats?.completed || 0}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <img src={assets.tick_icon} alt="Completed" className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardData.appointmentStats?.cancelled || 0}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <img src={assets.cancel_icon} alt="Cancelled" className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>



          {/* Latest Bookings Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <img src={assets.list_icon} alt="List" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Latest Bookings</h3>
                  <p className="text-sm text-gray-600">Recent appointment activities</p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                View All
              </button>
            </div>
            
            <div className="divide-y divide-gray-200">
              {dashboardData.latestAppointments?.length === 0 ? (
                <div className="text-center py-12">
                  <img src={assets.appointment_icon} alt="No bookings" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500 text-lg">No recent bookings</p>
                </div>
              ) : (
                dashboardData.latestAppointments?.map((booking, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        src={booking.docData.image || "https://via.placeholder.com/48x48?text=D"}
                        alt={booking.docData.name}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/48x48?text=D";
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{booking.docData.name}</p>
                        <p className="text-sm text-gray-500">{booking.docData.speciality}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {slotDateFormat(booking.slotDate)}
                        </p>
                      </div>
                    </div>
                    
                                         <div className="flex items-center gap-3">
                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.cancelled, booking.isCompleted)}`}>
                         {getStatusText(booking.cancelled, booking.isCompleted)}
                       </span>
                       <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
