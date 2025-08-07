/**
 * DoctorProfile page component for doctor panel.
 * Displays and allows editing of doctor profile information with modern UI design.
 * Features profile management, statistics, and professional layout.
 *
 * @module pages/Doctor/DoctorProfile
 */

import { useContext, useState, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { dtoken, backendUrl, appointmentStats, getAppointments } = useContext(DoctorContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    speciality: "",
    degree: "",
    experience: "",
    about: "",
    fees: "",
    available: true,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });

  /**
   * useEffect hook to fetch doctor profile and appointments when component mounts.
   */
  useEffect(() => {
    fetchDoctorProfile();
    getAppointments(); // Also fetch appointments for statistics
  }, []);

  /**
   * Fetches doctor profile data
   */
  const fetchDoctorProfile = async () => {
    setLoading(true);
    try {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) {
        toast.error("Doctor ID not found. Please login again.");
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/doctor/profile/${doctorId}`, {
        headers: { dtoken }
      });

      if (data.success) {
        setDoctor(data.doctor);
        setFormData({
          name: data.doctor.name || "",
          email: data.doctor.email || "",
          speciality: data.doctor.speciality || "",
          degree: data.doctor.degree || "",
          experience: data.doctor.experience || "",
          about: data.doctor.about || "",
          fees: data.doctor.fees || "",
          available: data.doctor.available !== undefined ? data.doctor.available : true,
          address: {
            street: data.doctor.address?.street || "",
            city: data.doctor.address?.city || "",
            state: data.doctor.address?.state || "",
            zipCode: data.doctor.address?.zipCode || ""
          }
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const doctorId = localStorage.getItem("doctorId");
      const { data } = await axios.put(`${backendUrl}/api/doctor/profile/${doctorId}`, formData, {
        headers: { dtoken }
      });

      if (data.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        await fetchDoctorProfile();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Formats currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
              currency: 'NPR',
    }).format(amount || 0);
  };

  /**
   * Calculates completion rate
   */
  const getCompletionRate = () => {
    if (!appointmentStats.total || appointmentStats.total === 0) return 0;
    return Math.round((appointmentStats.completed / appointmentStats.total) * 100);
  };

  /**
   * Gets status color for availability
   */
  const getAvailabilityColor = (available) => {
    return available 
      ? "bg-gradient-to-r from-green-500 to-emerald-500" 
      : "bg-gradient-to-r from-red-500 to-pink-500";
  };

  /**
   * Gets status text for availability
   */
  const getAvailabilityText = (available) => {
    return available ? "Available" : "Unavailable";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  My Profile
                </h1>
                <p className="text-gray-600 mt-1">Manage your professional information and practice</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Content */}
        {!loading && doctor && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Profile Section */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Profile Header */}
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={doctor.image || "https://via.placeholder.com/140x140?text=Doctor"}
                        alt={doctor.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/140x140?text=Doctor";
                        }}
                      />
                      {isEditing && (
                        <button
                          type="button"
                          className="absolute -bottom-2 -right-2 p-3 bg-white text-blue-600 rounded-full hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{doctor.name}</h2>
                      <p className="text-blue-100 text-lg mb-3">{doctor.speciality}</p>
                      <p className="text-blue-100 mb-4">{doctor.email}</p>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white ${getAvailabilityColor(doctor.available)} shadow-lg`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${doctor.available ? 'bg-green-300' : 'bg-red-300'}`}></div>
                          {getAvailabilityText(doctor.available)}
                        </span>
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                          {formatCurrency(doctor.fees)}/consultation
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 bg-gray-50">
                  <div className="flex space-x-8 px-8">
                    {[
                      { id: 'personal', label: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                      { id: 'professional', label: 'Professional', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                      { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                        </svg>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information Tab */}
                    {activeTab === 'personal' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                              placeholder="Enter your full name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Speciality</label>
                          <input
                            type="text"
                            name="speciality"
                            value={formData.speciality}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                            placeholder="Enter your medical speciality"
                          />
                        </div>

                        {/* Availability Toggle */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Availability Status</label>
                              <p className="text-xs text-gray-500 mt-1">Set your availability for appointments</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, available: !prev.available }))}
                              disabled={!isEditing}
                              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                formData.available ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-300'
                              } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                                  formData.available ? 'translate-x-8' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Professional Information Tab */}
                    {activeTab === 'professional' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Degree</label>
                            <input
                              type="text"
                              name="degree"
                              value={formData.degree}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                              placeholder="e.g., MBBS, MD, PhD"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Experience</label>
                            <input
                              type="text"
                              name="experience"
                              value={formData.experience}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                              placeholder="e.g., 10 years"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Consultation Fee</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              name="fees"
                              value={formData.fees}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">About</label>
                          <textarea
                            name="about"
                            value={formData.about}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300 resize-none"
                            placeholder="Tell patients about your expertise, approach, and what makes you unique..."
                          />
                          {!isEditing && formData.about && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                              <h4 className="text-sm font-semibold text-blue-900 mb-2">Preview:</h4>
                              <p className="text-sm text-blue-800 leading-relaxed">{formData.about}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Information Tab */}
                    {activeTab === 'contact' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Street Address</label>
                            <input
                              type="text"
                              name="address.street"
                              value={formData.address.street}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                              placeholder="Enter street address"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">City</label>
                            <input
                              type="text"
                              name="address.city"
                              value={formData.address.city}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                              placeholder="Enter city"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">State</label>
                            <input
                              type="text"
                              name="address.state"
                              value={formData.address.state}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                              placeholder="Enter state"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">ZIP Code</label>
                            <input
                              type="text"
                              name="address.zipCode"
                              value={formData.address.zipCode}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                              placeholder="Enter ZIP code"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Buttons */}
                    {isEditing && (
                      <div className="flex gap-4 pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none flex items-center gap-2 font-medium"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            fetchDoctorProfile(); // Reset form data
                          }}
                          className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Statistics Sidebar */}
            <div className="space-y-6">
              {/* Practice Statistics */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Practice Statistics</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Total Appointments</span>
                    <span className="font-bold text-2xl text-blue-600">{appointmentStats.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                    <span className="font-bold text-2xl text-green-600">{appointmentStats.completed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                    <span className="font-bold text-2xl text-yellow-600">{appointmentStats.pending || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Monthly Revenue</span>
                    <span className="font-bold text-2xl text-purple-600">{formatCurrency(appointmentStats.monthlyRevenue || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                    <span className="font-bold text-2xl text-indigo-600">{getCompletionRate()}%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 text-left text-sm font-medium text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View Appointments
                  </button>
                  <button className="w-full px-4 py-3 text-left text-sm font-medium text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Update Availability
                  </button>
                  <button className="w-full px-4 py-3 text-left text-sm font-medium text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-300 flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    View Earnings
                  </button>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Professional Info</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Degree</p>
                      <p className="text-xs text-gray-600">{doctor.degree || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Experience</p>
                      <p className="text-xs text-gray-600">{doctor.experience || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Consultation Fee</p>
                      <p className="text-xs text-gray-600">{formatCurrency(doctor.fees || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Contact Info</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {doctor.address?.street}, {doctor.address?.city}, {doctor.address?.state} {doctor.address?.zipCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile; 