/**
 * DoctorsList page component for admin panel.
 * Displays a list of all doctors with their details and availability toggle.
 * Features search, filtering, loading states, pagination, and modern modal forms.
 *
 * @module pages/Admin/DoctorsList
 */

import { useContext, useState, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import AddDoctorModal from "../../components/AddDoctorModal";

const DoctorsList = () => {
  const { doctors, token, getAllDoctors, changeAvailability } =
    useContext(AdminContext);
  
  // Local state for enhanced functionality
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpeciality, setFilterSpeciality] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [changingAvailability, setChangingAvailability] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination settings
  const itemsPerPage = 8;

  // Get unique specialities for filter
  const specialities = [...new Set(doctors.map(doctor => doctor.speciality))];

  /**
   * useEffect hook to fetch all doctors when the token is available.
   */
  useEffect(() => {
    if (token) {
      fetchDoctors();
    }
  }, [token]);

  /**
   * Fetches doctors with loading state
   */
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      await getAllDoctors();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles availability change with confirmation
   */
  const handleAvailabilityChange = async (doctor) => {
    if (window.confirm(`Are you sure you want to ${doctor.available ? 'disable' : 'enable'} ${doctor.name}?`)) {
      setChangingAvailability(doctor._id);
      try {
        await changeAvailability(doctor._id);
      } finally {
        setChangingAvailability(null);
      }
    }
  };

  /**
   * Filters doctors based on search term and filters
   */
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpeciality = filterSpeciality === "all" || doctor.speciality === filterSpeciality;
    const matchesAvailability = filterAvailability === "all" || 
                               (filterAvailability === "available" && doctor.available) ||
                               (filterAvailability === "unavailable" && !doctor.available);
    
    return matchesSearch && matchesSpeciality && matchesAvailability;
  });

  /**
   * Pagination calculations
   */
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex);

  /**
   * Opens doctor details modal
   */
  const openDoctorModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  /**
   * Opens create doctor modal
   */
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  /**
   * Opens edit doctor modal
   */
  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  /**
   * Closes doctor details modal
   */
  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
  };

  /**
   * Closes create modal
   */
  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  /**
   * Handles successful doctor operations
   */
  const handleDoctorSuccess = () => {
    fetchDoctors();
  };

  // Statistics
  const totalDoctors = doctors.length;
  const availableDoctors = doctors.filter(d => d.available).length;
  const unavailableDoctors = totalDoctors - availableDoctors;

  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto bg-gray-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={assets.doctor_icon} alt="Doctors" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-800">Doctors Management</h1>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <img src={assets.add_icon} alt="Add" className="w-5 h-5" />
            Add New Doctor
          </button>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{totalDoctors}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <img src={assets.people_icon} alt="Total" className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableDoctors}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <img src={assets.tick_icon} alt="Available" className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unavailable</p>
                <p className="text-2xl font-bold text-red-600">{unavailableDoctors}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <img src={assets.cancel_icon} alt="Unavailable" className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Doctors</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or speciality..."
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

            {/* Speciality Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Speciality</label>
              <select
                value={filterSpeciality}
                onChange={(e) => setFilterSpeciality(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Specialities</option>
                {specialities.map(speciality => (
                  <option key={speciality} value={speciality}>{speciality}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Doctors Grid */}
      {!loading && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing {currentDoctors.length} of {filteredDoctors.length} doctors (Page {currentPage} of {totalPages})
            </p>
            <button
              onClick={fetchDoctors}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {currentDoctors.length === 0 ? (
            <div className="text-center py-12">
              <img src={assets.doctor_icon} alt="No doctors" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 text-lg">No doctors found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentDoctors.map((doctor, index) => (
                <div
                  key={doctor._id || index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => openDoctorModal(doctor)}
                >
                  {/* Doctor Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
                    <img
                      src={doctor.image || "https://via.placeholder.com/300x200?text=Doctor"}
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=Doctor";
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doctor.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{doctor.speciality}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(doctor);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Doctor"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAvailabilityChange(doctor);
                          }}
                          disabled={changingAvailability === doctor._id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            doctor.available ? 'bg-green-600' : 'bg-gray-300'
                          } ${changingAvailability === doctor._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={doctor.available ? 'Set Unavailable' : 'Set Available'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              doctor.available ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">${doctor.fees}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modern Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredDoctors.length)}</span> of{' '}
                <span className="font-medium">{filteredDoctors.length}</span> results
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

      {/* Doctor Details Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Doctor Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedDoctor.image || "https://via.placeholder.com/400x300?text=Doctor"}
                    alt={selectedDoctor.name}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=Doctor";
                    }}
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedDoctor.name}</h3>
                  <p className="text-gray-600 mb-4">{selectedDoctor.speciality}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedDoctor.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDoctor.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    
                    {selectedDoctor.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Email:</span>
                        <span className="text-sm text-gray-600">{selectedDoctor.email}</span>
                      </div>
                    )}
                    
                    {selectedDoctor.fees && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Fees:</span>
                        <span className="text-sm text-gray-600">${selectedDoctor.fees}</span>
                      </div>
                    )}
                    
                    {selectedDoctor.experience && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Experience:</span>
                        <span className="text-sm text-gray-600">{selectedDoctor.experience}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        openEditModal(selectedDoctor);
                        closeModal();
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Doctor
                    </button>
                    <button
                      onClick={() => {
                        handleAvailabilityChange(selectedDoctor);
                        closeModal();
                      }}
                      disabled={changingAvailability === selectedDoctor._id}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedDoctor.available
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } ${changingAvailability === selectedDoctor._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {changingAvailability === selectedDoctor._id ? 'Updating...' : 
                       selectedDoctor.available ? 'Set Unavailable' : 'Set Available'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable AddDoctorModal for Create */}
      <AddDoctorModal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        onSuccess={handleDoctorSuccess}
        mode="create"
      />

      {/* Reusable AddDoctorModal for Edit */}
      <AddDoctorModal
        isOpen={showModal && selectedDoctor}
        onClose={closeModal}
        doctor={selectedDoctor}
        onSuccess={handleDoctorSuccess}
        mode="edit"
      />
    </div>
  );
};

export default DoctorsList;
