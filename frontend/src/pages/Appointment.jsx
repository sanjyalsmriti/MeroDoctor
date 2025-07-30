import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const navigate = useNavigate();
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const fetchDocInfo = () => {
    const doctorInfo = doctors.find((doc) => doc._id === docId);
    if (doctorInfo) {
      setDocInfo(doctorInfo);
    } else {
      setDocInfo(null);
    }
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }
      
      let timeSlots = [];
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime.toLowerCase();

        const isSlotAvailable =
          docInfo &&
          docInfo.slot_booked &&
          docInfo.slot_booked[slotDate] &&
          docInfo.slot_booked[slotDate].includes(slotTime)
            ? false
            : true;

        if (isSlotAvailable) {
          timeSlots.push({
            dateTime: new Date(currentDate),
            time: formattedTime,
          });
        }
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Please login to book an appointment");
      return navigate("/login");
    }
    
    if (!slotTime) {
      toast.error("Please select a time slot");
      return;
    }

    setIsBooking(true);
    try {
      const date = docSlots[slotIndex][0].dateTime;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [docId, doctors]);
  
  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  if (!docInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 text-sm font-medium mb-4 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Appointment
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Schedule with <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{docInfo.name}</span>
          </h1>
          <p className="text-lg text-gray-600">
            Choose your preferred date and time for your consultation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
              {/* Doctor Image */}
              <div className="relative">
                <img
                  className="w-full h-64 object-cover"
                  src={docInfo?.image}
                  alt={docInfo.name}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=Doctor";
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Available
                  </span>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-2xl font-bold text-gray-900">{docInfo.name}</h2>
                  <img className="w-5 h-5" src={assets.verified_icon} alt="Verified" />
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-600">{docInfo.degree}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{docInfo.speciality}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {docInfo.experience}
                  </span>
                </div>

                {/* About Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-900">About</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {docInfo.about}
                  </p>
                </div>

                {/* Appointment Fee */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Consultation Fee</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {currencySymbol} {docInfo.fees}
                    </span>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>30 minutes consultation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Online consultation available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Select Date & Time</h2>
              </div>

              {/* Date Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Date</h3>
                <div className="grid grid-cols-7 gap-3">
                  {docSlots.length > 0 &&
                    docSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSlotIndex(index)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                          slotIndex === index
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg"
                            : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          {slot[0] && daysOfWeek[slot[0].dateTime.getDay()]}
                        </div>
                        <div className="text-lg font-bold">
                          {slot[0] && slot[0].dateTime.getDate()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {slot[0] && slot[0].dateTime.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Time Selection */}
              {docSlots.length > 0 && docSlots[slotIndex].length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Time</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {docSlots[slotIndex].map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSlotTime(slot.time)}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 text-center ${
                          slot.time === slotTime
                            ? "border-blue-500 bg-blue-500 text-white shadow-lg"
                            : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {slot.time}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Button */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={bookAppointment}
                  disabled={!slotTime || isBooking}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-3 shadow-lg"
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Booking Appointment...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Appointment - {currencySymbol} {docInfo.fees}
                    </>
                  )}
                </button>
                
                {!slotTime && (
                  <p className="text-sm text-gray-500 text-center mt-3">
                    Please select a date and time to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Doctors */}
        <div className="mt-16">
          <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
        </div>
      </div>
    </div>
  );
};

export default Appointment;
