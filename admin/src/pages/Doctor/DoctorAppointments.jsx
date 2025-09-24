/**
 * DoctorAppointments page component for doctor panel.
 * Displays a list of appointments for the logged-in doctor with modern UI design.
 * Features search, filtering, pagination, loading states, and appointment management.
 *
 * @module pages/Doctor/DoctorAppointments
 */

import { useContext, useState, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const { appointments, appointmentStats, loading, getAppointments } = useContext(DoctorContext);
  const { slotDateFormat, calculateAge } = useContext(AppContext);
  
  // Local state for enhanced functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Pagination settings
  const itemsPerPage = 8;

  // Get unique statuses for filter
  const statuses = ["pending", "completed", "cancelled"];

  /**
   * useEffect hook to fetch appointments when component mounts.
   */
  useEffect(() => {
    getAppointments();
  }, []);

  /**
   * Handles appointment status update
   */
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdatingStatus(appointmentId);
    try {
      // Here you would call the API to update appointment status
      // For now, we'll just simulate the update
      console.log(`Updating appointment ${appointmentId} to ${newStatus}`);
      // await updateAppointmentStatus(appointmentId, newStatus);
      // await getAppointments(); // Refresh data
    } catch (error) {
      console.error("Error updating appointment status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  /**
   * Filters appointments based on search term and filters
   */
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "pending" && !appointment.cancelled && !appointment.isCompleted) ||
      (filterStatus === "completed" && appointment.isCompleted) ||
      (filterStatus === "cancelled" && appointment.cancelled);
    
    const matchesDate = !filterDate || appointment.slotDate === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  /**
   * Pagination calculations
   */
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  /**
   * Resets filters and search
   */
  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterDate("");
    setCurrentPage(1);
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
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto bg-gray-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={assets.appointments_icon} alt="Appointments" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
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
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{appointmentStats.total || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <img src={assets.appointment_icon} alt="Total" className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{appointmentStats.pending || 0}</p>
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
                <p className="text-2xl font-bold text-green-600">{appointmentStats.completed || 0}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <img src={assets.tick_icon} alt="Completed" className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(appointmentStats.monthlyRevenue || 0)}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Appointments</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by patient name, email, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Reset Filters Button */}
          {(searchTerm || filterStatus !== "all" || filterDate) && (
            <div className="mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Appointments List */}
      {!loading && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing {currentAppointments.length} of {filteredAppointments.length} appointments (Page {currentPage} of {totalPages})
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr_2fr_1fr_1fr_1fr] gap-4 py-4 px-6 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">Patient</p>
              <p className="text-sm font-medium text-gray-700">Contact Info</p>
              <p className="text-sm font-medium text-gray-700">Age</p>
              <p className="text-sm font-medium text-gray-700">Appointment Details</p>
              <p className="text-sm font-medium text-gray-700">Fees</p>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <p className="text-sm font-medium text-gray-700">Actions</p>
            </div>

            {/* Table Body */}
            {currentAppointments.length === 0 ? (
              <div className="text-center py-12">
                <img src={assets.appointment_icon} alt="No appointments" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-gray-500 text-lg">No appointments found matching your criteria</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {currentAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="md:grid md:grid-cols-[1fr_2fr_1fr_2fr_1fr_1fr_1fr] gap-4 py-4 px-6 hover:bg-gray-50 transition-colors"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">#{appointment._id.slice(-6)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.cancelled, appointment.isCompleted)}`}>
                          {getStatusText(appointment.cancelled, appointment.isCompleted)}
                        </span>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex items-center gap-3">
                      <img
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        src={appointment.userData.image || "https://via.placeholder.com/40x40?text=P"}
                        alt={appointment.userData.name}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/40x40?text=P";
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{appointment.userData.name}</p>
                        <p className="text-xs text-gray-500">Patient</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm text-gray-900">{appointment.userData.email}</p>
                        <p className="text-xs text-gray-500">{appointment.userData.phone || 'No phone'}</p>
                      </div>
                    </div>

                    {/* Age */}
                    <div className="flex items-center">
                      <p className="text-sm text-gray-900">{calculateAge(appointment.userData.dob)}</p>
                    </div>

                    {/* Appointment Details */}
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{slotDateFormat(appointment.slotDate)}</p>
                        <p className="text-xs text-gray-500">{appointment.slotTime}</p>
                      </div>
                    </div>

                    {/* Fees */}
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(appointment.amount)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="hidden md:flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.cancelled, appointment.isCompleted)}`}>
                        {getStatusText(appointment.cancelled, appointment.isCompleted)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!appointment.cancelled && !appointment.isCompleted && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                            disabled={updatingStatus === appointment._id}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as Completed"
                          >
                            {updatingStatus === appointment._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                            disabled={updatingStatus === appointment._id}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel Appointment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      <button
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modern Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredAppointments.length)}</span> of{' '}
                <span className="font-medium">{filteredAppointments.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorAppointments;