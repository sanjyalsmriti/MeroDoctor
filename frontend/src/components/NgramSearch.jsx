import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NgramSearch = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState("search"); // "search" or "match"
  
  // Symptom matching state
  const [symptoms, setSymptoms] = useState({
    primary: "",
    secondary: "",
    duration: "",
    severity: ""
  });
  
  // Patient preferences
  const [preferences, setPreferences] = useState({
    maxFees: "",
    preferredLocation: "",
    urgency: "normal",
    appointmentType: "consultation"
  });

  // Common symptoms for quick selection
  const commonSymptoms = [
    "headache", "fever", "cough", "chest pain", "stomach pain", "skin rash",
    "dizziness", "fatigue", "nausea", "shortness of breath", "joint pain",
    "back pain", "insomnia", "anxiety", "depression", "high blood pressure"
  ];

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/user/suggestions-ngrams?query=${searchQuery}&limit=5`,
        { headers: { token } }
      );
      
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const performNgramSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/search-ngrams`,
        {
          query: searchQuery.trim(),
          filters: {},
          limit: 20
        },
        { headers: { token } }
      );

      if (response.data.success) {
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error("Error performing N-gram search:", error);
    } finally {
      setLoading(false);
    }
  };

  const performPatientMatching = async () => {
    if (!symptoms.primary && !symptoms.secondary) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/match-patient`,
        {
          symptoms: {
            primary: symptoms.primary,
            secondary: symptoms.secondary,
            duration: symptoms.duration,
            severity: symptoms.severity
          },
          additionalCriteria: preferences,
          limit: 10
        },
        { headers: { token } }
      );

      if (response.data.success) {
        setSearchResults(response.data.matchedDoctors);
      }
    } catch (error) {
      console.error("Error performing patient matching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  };

  const handleSymptomSelect = (symptom) => {
    if (!symptoms.primary) {
      setSymptoms({ ...symptoms, primary: symptom });
    } else if (!symptoms.secondary) {
      setSymptoms({ ...symptoms, secondary: symptom });
    }
  };

  const clearSymptoms = () => {
    setSymptoms({
      primary: "",
      secondary: "",
      duration: "",
      severity: ""
    });
  };

  const handleDoctorClick = (doctorId) => {
    navigate(`/appointments/${doctorId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            N-gram Intelligent Search
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced search using N-gram algorithms for fuzzy matching, typo tolerance, and intelligent doctor-patient matching.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchMode("search")}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                  searchMode === "search"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Text Search
              </button>
              <button
                onClick={() => setSearchMode("match")}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                  searchMode === "match"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Symptom Matching
              </button>
            </div>
          </div>

          {searchMode === "search" ? (
            /* Text Search Mode */
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search doctors by name, speciality, or symptoms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                
                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-gray-700">{suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={performNgramSearch}
                disabled={loading}
                className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Searching with N-grams...
                  </div>
                ) : (
                  "Search with N-gram Algorithm"
                )}
              </button>
            </div>
          ) : (
            /* Symptom Matching Mode */
            <div className="space-y-6">
              {/* Symptoms Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Symptoms</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Symptom</label>
                    <input
                      type="text"
                      placeholder="e.g., headache, chest pain"
                      value={symptoms.primary}
                      onChange={(e) => setSymptoms({...symptoms, primary: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Symptom</label>
                    <input
                      type="text"
                      placeholder="e.g., fever, nausea"
                      value={symptoms.secondary}
                      onChange={(e) => setSymptoms({...symptoms, secondary: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select
                      value={symptoms.duration}
                      onChange={(e) => setSymptoms({...symptoms, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select duration</option>
                      <option value="acute">Acute (less than 1 week)</option>
                      <option value="subacute">Subacute (1-4 weeks)</option>
                      <option value="chronic">Chronic (more than 4 weeks)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      value={symptoms.severity}
                      onChange={(e) => setSymptoms({...symptoms, severity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select severity</option>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>

                {/* Common Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select Common Symptoms</label>
                  <div className="flex flex-wrap gap-2">
                    {commonSymptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => handleSymptomSelect(symptom)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={clearSymptoms}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Clear all symptoms
                  </button>
                </div>
              </div>

              {/* Preferences Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Fees</label>
                    <input
                      type="number"
                      placeholder="e.g., 100"
                      value={preferences.maxFees}
                      onChange={(e) => setPreferences({...preferences, maxFees: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="e.g., London, UK"
                      value={preferences.preferredLocation}
                      onChange={(e) => setPreferences({...preferences, preferredLocation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                    <select
                      value={preferences.urgency}
                      onChange={(e) => setPreferences({...preferences, urgency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                    <select
                      value={preferences.appointmentType}
                      onChange={(e) => setPreferences({...preferences, appointmentType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="followup">Follow-up</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={performPatientMatching}
                disabled={loading}
                className="w-full px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Matching with N-grams...
                  </div>
                ) : (
                  "Find Matching Doctors"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchMode === "search" ? "Search Results" : "Matched Doctors"} ({searchResults.length})
              </h2>
              <div className="text-sm text-gray-500">
                {searchMode === "search" 
                  ? "Results ranked by N-gram similarity" 
                  : "Results ranked by symptom and preference matching"
                }
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((doctor) => (
                <div
                  key={doctor._id}
                  onClick={() => handleDoctorClick(doctor._id)}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer"
                >
                  {/* Doctor Image */}
                  <div className="relative mb-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=Doctor";
                      }}
                    />
                    
                    {/* Score Badge */}
                    {(doctor.similarityScore || doctor.matchingScore) && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {Math.round((doctor.similarityScore || doctor.matchingScore) * 100)}% Match
                      </div>
                    )}

                    {/* Availability Badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        doctor.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          doctor.available ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {doctor.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {doctor.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">{doctor.speciality}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{doctor.experience}</span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-blue-600">
                        NPR {doctor.fees}
                      </span>
                    </div>

                    {/* Match Reasons */}
                    {doctor.matchReasons && doctor.matchReasons.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {doctor.matchReasons.slice(0, 2).map((reason, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {reason}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* N-gram Matches */}
                    {doctor.ngramMatches && (
                      <div className="text-xs text-gray-500 mb-3">
                        N-gram matches: {doctor.ngramMatches}
                      </div>
                    )}

                    {/* Recommended Reason */}
                    {doctor.recommendedReason && (
                      <div className="text-sm text-blue-600 font-medium mb-3">
                        {doctor.recommendedReason}
                      </div>
                    )}

                    <button className="w-full mt-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchResults.length === 0 && !loading && (searchQuery || symptoms.primary) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or symptoms to find more results.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                clearSymptoms();
                setSearchResults([]);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NgramSearch; 