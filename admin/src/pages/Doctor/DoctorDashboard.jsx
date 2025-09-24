/**
 * DoctorDashboard page component for doctor panel.
 * Displays summary statistics, charts, and latest appointments for the logged-in doctor.
 * Features modern UI design with enhanced visualizations and responsive layout.
 *
 * @module pages/Doctor/DoctorDashboard
 */

import { useContext, useState, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorDashboard = () => {
  const { appointments, appointmentStats, loading, getAppointments } = useContext(DoctorContext);
  const { slotDateFormat } = useContext(AppContext);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  /**
   * useEffect hook to fetch appointments when component mounts.
   */
  useEffect(() => {
    getAppointments();
    // Get current doctor info from localStorage
    const doctorInfo = localStorage.getItem("doctorInfo");
    if (doctorInfo) {
      setCurrentDoctor(JSON.parse(doctorInfo));
    }
  }, []);

  /**
   * Formats currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
   * Calculate weekly trends for the last 7 days
   */
  const getWeeklyTrends = () => {
    const trends = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const dayAppointments = appointments.filter(apt => 
        new Date(apt.date) >= dayStart && new Date(apt.date) < dayEnd
      ).length;
      
      trends.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayAppointments
      });
    }
    
    return trends;
  };

  /**
   * Get recent appointments for display
   */
  const getRecentAppointments = () => {
    return appointments
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const weeklyTrends = getWeeklyTrends();
  const recentAppointments = getRecentAppointments();

  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto bg-gray-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {currentDoctor?.name || 'Doctor'}! Here's your practice overview.
              </p>
            </div>
          </div>
          <button
            onClick={getAppointments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
      {!loading && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Appointments Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{appointmentStats.total || 0}</p>
                  <p className="text-xs text-green-600 mt-1">
                    All time appointments
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <img src={assets.appointment_icon} alt="Appointments" className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Pending Appointments Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{appointmentStats.pending || 0}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Awaiting confirmation
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Completed Appointments Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{appointmentStats.completed || 0}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Successfully treated
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <img src={assets.tick_icon} alt="Completed" className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Monthly Revenue Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(appointmentStats.monthlyRevenue || 0)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    This month's earnings
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Appointment Trends */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Weekly Appointment Trends</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Last 7 Days</span>
                </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-2">
                {weeklyTrends.map((trend, index) => {
                  const maxCount = Math.max(...weeklyTrends.map(t => t.count));
                  const percentage = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-100 rounded-t"
                        style={{ height: `${percentage}%` }}
                      >
                        <div 
                          className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">
                        {trend.day}
                      </span>
                      <span className="text-xs text-gray-700 font-medium">
                        {trend.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Practice Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Practice Performance</h3>
                <span className="text-sm text-gray-600">This Month</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completion Rate</p>
                    <p className="text-xs text-gray-500">Successfully completed appointments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {appointmentStats.total > 0 
                        ? Math.round((appointmentStats.completed / appointmentStats.total) * 100) 
                        : 0}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Monthly Appointments</p>
                    <p className="text-xs text-gray-500">Appointments this month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{appointmentStats.monthly || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Average Daily</p>
                    <p className="text-xs text-gray-500">Appointments per day</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      {Math.round((appointmentStats.monthly || 0) / 30)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Appointments Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <img src={assets.list_icon} alt="List" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Recent Appointments</h3>
                  <p className="text-sm text-gray-600">Latest patient appointments</p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                View All
              </button>
            </div>
            
            <div className="divide-y divide-gray-200">
              {recentAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <img src={assets.appointment_icon} alt="No appointments" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500 text-lg">No recent appointments</p>
                </div>
              ) : (
                recentAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        src={appointment.userData.image || "https://via.placeholder.com/48x48?text=P"}
                        alt={appointment.userData.name}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/48x48?text=P";
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{appointment.userData.name}</p>
                        <p className="text-sm text-gray-500">{appointment.userData.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {slotDateFormat(appointment.slotDate)} at {appointment.slotTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.cancelled, appointment.isCompleted)}`}>
                        {getStatusText(appointment.cancelled, appointment.isCompleted)}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(appointment.amount)}
                        </p>
                      </div>
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

export default DoctorDashboard; 