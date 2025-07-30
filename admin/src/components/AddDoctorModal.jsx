/**
 * Reusable AddDoctorModal component for creating and editing doctors.
 * Can be used as a modal popup for both add and edit operations.
 * Features image upload, form validation, and professional styling.
 *
 * @module components/AddDoctorModal
 */

import { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import specialities from "../config/speciality";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";
import { useContext } from "react";
import axios from "axios";

const AddDoctorModal = ({ 
  isOpen, 
  onClose, 
  doctor = null, 
  onSuccess,
  mode = "create" // "create" or "edit"
}) => {
  const [docImg, setDocImg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    experience: "1 year",
    fees: "",
    about: "",
    speciality: "general_physician",
    degree: "",
    address1: "",
    address2: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { backendUrl, token } = useContext(AdminContext);

  // Initialize form data when doctor prop changes (for edit mode)
  useEffect(() => {
    if (doctor && mode === "edit") {
      setFormData({
        name: doctor.name || "",
        email: doctor.email || "",
        password: "",
        experience: doctor.experience || "1 year",
        fees: doctor.fees || "",
        about: doctor.about || "",
        speciality: doctor.speciality || "general_physician",
        degree: doctor.degree || "",
        address1: doctor.address?.line1 || "",
        address2: doctor.address?.line2 || "",
      });
      setDocImg(null); // Don't pre-fill image for edit mode
    } else if (mode === "create") {
      resetForm();
    }
  }, [doctor, mode]);

  /**
   * Handles form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Resets form data
   */
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      experience: "1 year",
      fees: "",
      about: "",
      speciality: "general_physician",
      degree: "",
      address1: "",
      address2: "",
    });
    setDocImg(null);
  };

  /**
   * Handles the form submission for adding/editing a doctor.
   * Validates input, uploads image and doctor details to backend.
   * Shows toast notifications for success or error.
   *
   * @async
   * @function onSubmitHandler
   * @param {React.FormEvent<HTMLFormElement>} event - The form submit event
   * @returns {Promise<void>}
   */
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "create" && !docImg) {
        toast.error("Please select an image");
        return;
      }

      const formDataToSend = new FormData();
      if (docImg) {
        formDataToSend.append("image", docImg);
      }
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      if (formData.password) {
        formDataToSend.append("password", formData.password);
      }
      formDataToSend.append("experience", formData.experience);
      formDataToSend.append("fees", formData.fees);
      formDataToSend.append("about", formData.about);
      formDataToSend.append("speciality", formData.speciality);
      formDataToSend.append("degree", formData.degree);
      formDataToSend.append(
        "address",
        JSON.stringify({ line1: formData.address1, line2: formData.address2 })
      );

      const endpoint = mode === "create" 
        ? `${backendUrl}/api/admin/add-doctor`
        : `${backendUrl}/api/admin/update-doctor/${doctor._id}`;

      const { data } = await axios.post(endpoint, formDataToSend, {
        headers: {
          token,
        },
      });
      
      if (data.success) {
        toast.success(data.message || (mode === "create" ? "Doctor added successfully" : "Doctor updated successfully"));
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? 'Add New Doctor' : 'Edit Doctor'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-6">
            {/* Image Upload */}
            <div className="flex items-center gap-4">
              <label htmlFor="doc-img" className="cursor-pointer">
                <img
                  src={docImg ? URL.createObjectURL(docImg) : (doctor?.image || assets.upload_area)}
                  className="w-20 h-20 bg-gray-100 rounded-full object-cover border-2 border-gray-300 hover:border-blue-500 transition-colors"
                  alt="Doctor"
                />
              </label>
              <input
                onChange={(e) => setDocImg(e.target.files[0])}
                type="file"
                id="doc-img"
                accept="image/*"
                className="hidden"
                required={mode === "create"}
              />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {mode === "create" ? "Upload doctor picture" : "Change doctor picture"}
                </p>
                <p className="text-xs text-gray-500">
                  {mode === "create" ? "Click to upload image" : "Click to change image (optional)"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter doctor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {mode === "create" && '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={mode === "create"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={mode === "edit" ? "Leave blank to keep current" : "Enter password"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience *
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fees *
                </label>
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter consultation fees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speciality *
                </label>
                <select
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Speciality</option>
                  {specialities.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education *
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., MBBS, MD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="address1"
                  value={formData.address1}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional address info"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Doctor *
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about the doctor's expertise and experience"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {mode === "create" ? 'Adding...' : 'Updating...'}
                  </>
                ) : (
                  mode === "create" ? 'Add Doctor' : 'Update Doctor'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDoctorModal; 