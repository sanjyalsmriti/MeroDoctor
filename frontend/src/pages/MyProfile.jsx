import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const MyProfile = () => {
  const { userData, setUserData, backendUrl, token, loadUserProfileData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateUserProfileData = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      formData.append("userId", userData._id);

      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        {
          headers: {
            token,
          },
        }
      );
      if (data.success) {
        toast.success("Profile updated successfully");
        setIsEdit(false);
        setImage(null);
        loadUserProfileData();
      } else {
        toast.error(data.message || "Failed to update profile data");
        console.log("Error updating profile data:", data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile data");
      console.log("Error updating profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
    }
  };

  const cancelEdit = () => {
    setIsEdit(false);
    setImage(null);
    // Reset form data to original values
    loadUserProfileData();
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 rounded-full text-blue-700 text-sm font-semibold mb-6 shadow-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Management
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            My <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Manage your personal information and keep your profile up to date
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Profile Image Section */}
              <div className="flex-shrink-0">
                <div className="text-center">
                  {isEdit ? (
                    <label htmlFor="image" className="cursor-pointer group">
                      <div className="relative inline-block">
                        <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl border-4 border-white group-hover:border-blue-200 transition-all duration-300">
                          <img
                            className="w-full h-full object-cover"
                            src={image ? URL.createObjectURL(image) : userData.image}
                            alt="Profile"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/192x192?text=Profile";
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-4 font-medium">Click to change photo</p>
                      <input
                        onChange={handleImageChange}
                        type="file"
                        id="image"
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl border-4 border-white mx-auto">
                      <img
                        className="w-full h-full object-cover"
                        src={userData.image}
                        alt="Profile"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/192x192?text=Profile";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              <div className="flex-1 space-y-8">
                {/* Name Section */}
                <div>
                  {isEdit ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg font-medium"
                        placeholder="Enter your full name"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{userData.name}</h2>
                      <p className="text-gray-600">Member since {new Date(userData.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50/50 rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Contact Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm font-semibold text-gray-700 min-w-24">Email:</label>
                      <span className="text-blue-600 font-medium">{userData.email}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm font-semibold text-gray-700 min-w-24">Phone:</label>
                      {isEdit ? (
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <span className="text-gray-800 font-medium">{userData.phone}</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="text-sm font-semibold text-gray-700 min-w-24">Address:</label>
                      {isEdit ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={userData.address?.line1 || ''}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                address: { ...userData.address, line1: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            placeholder="Address Line 1"
                          />
                          <input
                            type="text"
                            value={userData.address?.line2 || ''}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                address: { ...userData.address, line2: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            placeholder="Address Line 2 (Optional)"
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-gray-800">
                            {userData.address?.line1 || 'No address provided'}
                            {userData.address?.line2 && (
                              <span className="block">{userData.address.line2}</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-gray-50/50 rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm font-semibold text-gray-700 min-w-24">Gender:</label>
                      {isEdit ? (
                        <select
                          value={userData.gender}
                          onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="text-gray-800 font-medium">{userData.gender}</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm font-semibold text-gray-700 min-w-24">Date of Birth:</label>
                      {isEdit ? (
                        <input
                          type="date"
                          value={userData.dob}
                          onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      ) : (
                        <span className="text-gray-800 font-medium">
                          {new Date(userData.dob).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  {isEdit ? (
                    <>
                      <button
                        onClick={updateUserProfileData}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isLoading ? (
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
                        onClick={cancelEdit}
                        disabled={isLoading}
                        className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEdit(true)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
