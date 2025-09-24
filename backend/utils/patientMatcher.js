/**
 * Patient Matching Algorithm using N-grams
 * Implements intelligent doctor-patient matching based on symptoms, preferences, and medical history
 * 
 * @module utils/patientMatcher
 */

import Doctor from '../models/doctorModel.js';
import User from '../models/userModel.js';
import appointmentModel from '../models/appointmentModel.js';
import ngramSearch from './ngramSearch.js';

/**
 * Patient Matcher Class
 * Handles intelligent doctor-patient matching using N-gram algorithms
 */
class PatientMatcher {
  constructor() {
    this.symptomIndex = new Map();
    this.preferenceIndex = new Map();
    this.medicalHistoryIndex = new Map();
    this.specialitySymptoms = new Map();
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Initialize symptom-speciality mappings
   */
  initializeSymptomMappings() {
    this.specialitySymptoms = new Map([
      ['dermatologist', [
        'skin rash', 'acne', 'eczema', 'psoriasis', 'mole', 'wart', 'hair loss',
        'itching', 'redness', 'swelling', 'dermatitis', 'fungal infection'
      ]],
      ['cardiologist', [
        'chest pain', 'heart palpitations', 'shortness of breath', 'high blood pressure',
        'irregular heartbeat', 'dizziness', 'fainting', 'swelling in legs'
      ]],
      ['neurologist', [
        'headache', 'migraine', 'seizures', 'numbness', 'tingling', 'memory loss',
        'confusion', 'balance problems', 'tremors', 'paralysis'
      ]],
      ['gastroenterologist', [
        'stomach pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'heartburn',
        'acid reflux', 'bloating', 'loss of appetite', 'weight loss'
      ]],
      ['gynecologist', [
        'menstrual pain', 'irregular periods', 'pregnancy', 'fertility', 'menopause',
        'vaginal discharge', 'pelvic pain', 'breast pain'
      ]],
      ['pediatrician', [
        'fever', 'cough', 'cold', 'ear infection', 'vaccination', 'growth problems',
        'behavioral issues', 'developmental delays'
      ]],
      ['general_physician', [
        'fever', 'cough', 'cold', 'flu', 'fatigue', 'body aches', 'general checkup',
        'vaccination', 'preventive care'
      ]]
    ]);
  }

  /**
   * Build patient preference index
   * @param {Array} patients - Array of patient objects
   */
  buildPatientIndex(patients) {
    this.preferenceIndex.clear();
    this.medicalHistoryIndex.clear();

    patients.forEach(patient => {
      const patientId = patient._id.toString();
      const preferences = this.extractPatientPreferences(patient);
      const medicalHistory = this.extractMedicalHistory(patient);

      this.preferenceIndex.set(patientId, preferences);
      this.medicalHistoryIndex.set(patientId, medicalHistory);
    });
  }

  /**
   * Extract patient preferences from user data
   * @param {Object} patient - Patient object
   * @returns {Object} Patient preferences
   */
  extractPatientPreferences(patient) {
    return {
      preferredSpecialities: patient.preferences?.specialities || [],
      maxFees: patient.preferences?.maxFees || 200,
      preferredLocation: patient.preferences?.location || '',
      preferredGender: patient.preferences?.gender || '',
      preferredExperience: patient.preferences?.minExperience || 0,

      urgency: patient.preferences?.urgency || 'normal',
      appointmentType: patient.preferences?.appointmentType || 'consultation'
    };
  }

  /**
   * Extract medical history from patient data
   * @param {Object} patient - Patient object
   * @returns {Object} Medical history
   */
  extractMedicalHistory(patient) {
    return {
      chronicConditions: patient.medicalHistory?.chronicConditions || [],
      allergies: patient.medicalHistory?.allergies || [],
      medications: patient.medicalHistory?.medications || [],
      surgeries: patient.medicalHistory?.surgeries || [],
      familyHistory: patient.medicalHistory?.familyHistory || []
    };
  }

  /**
   * Match patient with doctors using N-gram algorithm
   * @param {string} patientId - Patient ID
   * @param {Object} symptoms - Patient symptoms
   * @param {Object} additionalCriteria - Additional matching criteria
   * @param {number} limit - Number of recommendations
   * @returns {Array} Matched doctors with scores
   */
  async matchPatientWithDoctors(patientId, symptoms = {}, additionalCriteria = {}, limit = 10) {
    try {
      const cacheKey = `match_${patientId}_${JSON.stringify(symptoms)}_${JSON.stringify(additionalCriteria)}`;
      
      // Check cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          return cached.data;
        }
      }

      // Get patient data
      const patient = await User.findById(patientId).select('-password');
      if (!patient) throw new Error('Patient not found');

      // Initialize symptom mappings if not done
      if (this.specialitySymptoms.size === 0) {
        this.initializeSymptomMappings();
      }

      // Get all available doctors
      const doctors = await Doctor.find({ available: true }).select('-password');
      
      // Build n-gram index for doctors
      ngramSearch.buildDoctorIndex(doctors);

      // Extract patient preferences and medical history
      const preferences = this.extractPatientPreferences(patient);
      const medicalHistory = this.extractMedicalHistory(patient);

      // Calculate matching scores
      const matchedDoctors = await this.calculateMatchingScores(
        doctors, 
        symptoms, 
        preferences, 
        medicalHistory, 
        additionalCriteria
      );

      // Sort by score and limit results
      const finalResults = matchedDoctors
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit)
        .map(result => ({
          ...result.doctor.toObject(),
          matchingScore: result.totalScore,
          scoreBreakdown: result.scoreBreakdown,
          matchReasons: this.getMatchReasons(result, symptoms, preferences),
          recommendedReason: this.getRecommendedReason(result, symptoms)
        }));

      // Cache results
      this.cache.set(cacheKey, {
        data: finalResults,
        timestamp: Date.now()
      });

      return finalResults;

    } catch (error) {
      console.error('Error in matchPatientWithDoctors:', error);
      throw error;
    }
  }

  /**
   * Calculate matching scores for all doctors
   * @param {Array} doctors - Array of doctors
   * @param {Object} symptoms - Patient symptoms
   * @param {Object} preferences - Patient preferences
   * @param {Object} medicalHistory - Patient medical history
   * @param {Object} additionalCriteria - Additional criteria
   * @returns {Array} Doctors with matching scores
   */
  async calculateMatchingScores(doctors, symptoms, preferences, medicalHistory, additionalCriteria) {
    const results = [];

    for (const doctor of doctors) {
      const scoreBreakdown = {
        specialityMatch: 0,
        symptomMatch: 0,
        preferenceMatch: 0,
        experienceMatch: 0,
        availabilityMatch: 0,

        locationMatch: 0,
        medicalHistoryMatch: 0
      };

      // 1. Speciality matching (30% weight)
      scoreBreakdown.specialityMatch = this.calculateSpecialityMatch(doctor, symptoms, preferences);

      // 2. Symptom matching (25% weight)
      scoreBreakdown.symptomMatch = this.calculateSymptomMatch(doctor, symptoms);

      // 3. Preference matching (20% weight)
      scoreBreakdown.preferenceMatch = this.calculatePreferenceMatch(doctor, preferences);

      // 4. Experience matching (10% weight)
      scoreBreakdown.experienceMatch = this.calculateExperienceMatch(doctor, preferences);

      // 5. Availability matching (5% weight)
      scoreBreakdown.availabilityMatch = this.calculateAvailabilityMatch(doctor, preferences);



      // 7. Location matching (3% weight)
      scoreBreakdown.locationMatch = this.calculateLocationMatch(doctor, preferences);

      // 8. Medical history matching (2% weight)
      scoreBreakdown.medicalHistoryMatch = this.calculateMedicalHistoryMatch(doctor, medicalHistory);

      // Calculate total weighted score
      const weights = {
        specialityMatch: 0.30,
        symptomMatch: 0.25,
        preferenceMatch: 0.20,
        experienceMatch: 0.10,
        availabilityMatch: 0.05,

        locationMatch: 0.03,
        medicalHistoryMatch: 0.02
      };

      let totalScore = 0;
      Object.entries(weights).forEach(([key, weight]) => {
        totalScore += scoreBreakdown[key] * weight;
      });

      // Apply urgency multiplier
      if (preferences.urgency === 'urgent') {
        totalScore *= 1.2; // 20% boost for urgent cases
      } else if (preferences.urgency === 'emergency') {
        totalScore *= 1.5; // 50% boost for emergency cases
      }

      results.push({
        doctor,
        totalScore: Math.min(totalScore, 1),
        scoreBreakdown
      });
    }

    return results;
  }

  /**
   * Calculate speciality matching score
   * @param {Object} doctor - Doctor object
   * @param {Object} symptoms - Patient symptoms
   * @param {Object} preferences - Patient preferences
   * @returns {number} Speciality match score
   */
  calculateSpecialityMatch(doctor, symptoms, preferences) {
    let score = 0;
    const doctorSpeciality = doctor.speciality.toLowerCase();

    // Check if doctor's speciality matches patient's preferred specialities
    if (preferences.preferredSpecialities.length > 0) {
      const preferredMatch = preferences.preferredSpecialities.some(spec => 
        spec.toLowerCase() === doctorSpeciality
      );
      if (preferredMatch) score += 0.8;
    }

    // Check if doctor's speciality matches symptoms
    const symptomSpeciality = this.getSpecialityFromSymptoms(symptoms);
    if (symptomSpeciality && symptomSpeciality === doctorSpeciality) {
      score += 0.9;
    } else if (symptomSpeciality && this.areSpecialitiesRelated(symptomSpeciality, doctorSpeciality)) {
      score += 0.7;
    }

    // Use N-gram similarity for fuzzy speciality matching
    const specialitySimilarity = ngramSearch.calculateDiceSimilarity(
      new Set(ngramSearch.generateNgrams(doctorSpeciality, 3)),
      new Set(ngramSearch.generateNgrams(symptomSpeciality || '', 3))
    );
    score += specialitySimilarity * 0.3;

    return Math.min(score, 1);
  }

  /**
   * Calculate symptom matching score
   * @param {Object} doctor - Doctor object
   * @param {Object} symptoms - Patient symptoms
   * @returns {number} Symptom match score
   */
  calculateSymptomMatch(doctor, symptoms) {
    if (!symptoms || Object.keys(symptoms).length === 0) return 0.5;

    const doctorSpeciality = doctor.speciality.toLowerCase();
    const specialitySymptoms = this.specialitySymptoms.get(doctorSpeciality) || [];
    
    let matchCount = 0;
    let totalSymptoms = 0;

    Object.values(symptoms).forEach(symptom => {
      if (typeof symptom === 'string') {
        totalSymptoms++;
        const symptomLower = symptom.toLowerCase();
        
        // Check exact match
        if (specialitySymptoms.some(s => s.toLowerCase() === symptomLower)) {
          matchCount++;
        } else {
          // Use N-gram similarity for fuzzy symptom matching
          const symptomNgrams = new Set(ngramSearch.generateNgrams(symptomLower, 3));
          const specialityNgrams = new Set(ngramSearch.generateNgrams(specialitySymptoms.join(' '), 3));
          
          const similarity = ngramSearch.calculateDiceSimilarity(symptomNgrams, specialityNgrams);
          if (similarity > 0.6) {
            matchCount += similarity;
          }
        }
      }
    });

    return totalSymptoms > 0 ? matchCount / totalSymptoms : 0.5;
  }

  /**
   * Calculate preference matching score
   * @param {Object} doctor - Doctor object
   * @param {Object} preferences - Patient preferences
   * @returns {number} Preference match score
   */
  calculatePreferenceMatch(doctor, preferences) {
    let score = 0;

    // Fee matching
    if (doctor.fees <= preferences.maxFees) {
      score += 0.3;
    } else {
      const feeRatio = preferences.maxFees / doctor.fees;
      score += feeRatio * 0.3;
    }

    // Gender preference (if specified)
    if (preferences.preferredGender && doctor.gender === preferences.preferredGender) {
      score += 0.2;
    }

    // Appointment type preference
    if (preferences.appointmentType === 'consultation' && doctor.available) {
      score += 0.2;
    }

    // Experience preference
    if (preferences.preferredExperience > 0) {
      const yearsMatch = doctor.experience.match(/(\d+)\s*years?/i);
      if (yearsMatch && parseInt(yearsMatch[1]) >= preferences.preferredExperience) {
        score += 0.3;
      }
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate experience matching score
   * @param {Object} doctor - Doctor object
   * @param {Object} preferences - Patient preferences
   * @returns {number} Experience match score
   */
  calculateExperienceMatch(doctor, preferences) {
    const yearsMatch = doctor.experience.match(/(\d+)\s*years?/i);
    if (!yearsMatch) return 0.5;

    const years = parseInt(yearsMatch[1]);
    
    if (years >= 10) return 1.0;
    if (years >= 5) return 0.8;
    if (years >= 3) return 0.6;
    if (years >= 1) return 0.4;
    
    return 0.2;
  }

  /**
   * Calculate availability matching score
   * @param {Object} doctor - Doctor object
   * @param {Object} preferences - Patient preferences
   * @returns {number} Availability match score
   */
  calculateAvailabilityMatch(doctor, preferences) {
    if (preferences.urgency === 'urgent' || preferences.urgency === 'emergency') {
      return doctor.available ? 1.0 : 0.0;
    }
    
    return doctor.available ? 0.8 : 0.2;
  }



  /**
   * Calculate location matching score
   * @param {Object} doctor - Doctor object
   * @param {Object} preferences - Patient preferences
   * @returns {number} Location match score
   */
  calculateLocationMatch(doctor, preferences) {
    if (!preferences.preferredLocation || !doctor.address) return 0.5;

    // Simple location matching (can be enhanced with actual geocoding)
    const doctorLocation = `${doctor.address.line1} ${doctor.address.line2}`.toLowerCase();
    const patientLocation = preferences.preferredLocation.toLowerCase();

    // Use N-gram similarity for location matching
    const locationSimilarity = ngramSearch.calculateDiceSimilarity(
      new Set(ngramSearch.generateNgrams(doctorLocation, 3)),
      new Set(ngramSearch.generateNgrams(patientLocation, 3))
    );

    return locationSimilarity;
  }

  /**
   * Calculate medical history matching score
   * @param {Object} doctor - Doctor object
   * @param {Object} medicalHistory - Patient medical history
   * @returns {number} Medical history match score
   */
  calculateMedicalHistoryMatch(doctor, medicalHistory) {
    if (!medicalHistory || Object.keys(medicalHistory).length === 0) return 0.5;

    let score = 0;
    let totalConditions = 0;

    // Check if doctor's speciality is relevant to patient's conditions
    Object.values(medicalHistory).flat().forEach(condition => {
      if (typeof condition === 'string') {
        totalConditions++;
        const conditionLower = condition.toLowerCase();
        const doctorSpeciality = doctor.speciality.toLowerCase();

        // Use N-gram similarity to check condition-speciality relevance
        const conditionNgrams = new Set(ngramSearch.generateNgrams(conditionLower, 3));
        const specialityNgrams = new Set(ngramSearch.generateNgrams(doctorSpeciality, 3));
        
        const similarity = ngramSearch.calculateDiceSimilarity(conditionNgrams, specialityNgrams);
        if (similarity > 0.5) {
          score += similarity;
        }
      }
    });

    return totalConditions > 0 ? score / totalConditions : 0.5;
  }

  /**
   * Get speciality from symptoms using N-gram matching
   * @param {Object} symptoms - Patient symptoms
   * @returns {string|null} Matched speciality
   */
  getSpecialityFromSymptoms(symptoms) {
    if (!symptoms || Object.keys(symptoms).length === 0) return null;

    const symptomText = Object.values(symptoms).join(' ').toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    this.specialitySymptoms.forEach((symptomList, speciality) => {
      const specialityText = symptomList.join(' ').toLowerCase();
      
      const symptomNgrams = new Set(ngramSearch.generateNgrams(symptomText, 3));
      const specialityNgrams = new Set(ngramSearch.generateNgrams(specialityText, 3));
      
      const similarity = ngramSearch.calculateDiceSimilarity(symptomNgrams, specialityNgrams);
      
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = speciality;
      }
    });

    return bestScore > 0.3 ? bestMatch : null;
  }

  /**
   * Check if two specialities are related
   * @param {string} speciality1 - First speciality
   * @param {string} speciality2 - Second speciality
   * @returns {boolean} Whether specialities are related
   */
  areSpecialitiesRelated(speciality1, speciality2) {
    const relatedSpecialities = {
      'general_physician': ['internal_medicine', 'family_medicine'],
      'cardiologist': ['internal_medicine'],
      'neurologist': ['internal_medicine'],
      'gastroenterologist': ['internal_medicine'],
      'dermatologist': ['general_physician'],
      'pediatrician': ['general_physician']
    };

    const related = relatedSpecialities[speciality1] || [];
    return related.includes(speciality2) || speciality1 === speciality2;
  }

  /**
   * Get match reasons for a doctor
   * @param {Object} result - Matching result
   * @param {Object} symptoms - Patient symptoms
   * @param {Object} preferences - Patient preferences
   * @returns {Array} Match reasons
   */
  getMatchReasons(result, symptoms, preferences) {
    const reasons = [];
    const { scoreBreakdown } = result;

    if (scoreBreakdown.specialityMatch > 0.8) {
      reasons.push('Perfect speciality match for your condition');
    } else if (scoreBreakdown.specialityMatch > 0.6) {
      reasons.push('Good speciality match for your symptoms');
    }

    if (scoreBreakdown.symptomMatch > 0.7) {
      reasons.push('Expert in treating your specific symptoms');
    }

    if (scoreBreakdown.preferenceMatch > 0.8) {
      reasons.push('Meets all your preferences');
    }

    if (scoreBreakdown.experienceMatch > 0.8) {
      reasons.push('Highly experienced specialist');
    }

    if (scoreBreakdown.availabilityMatch > 0.8) {
      reasons.push('Currently available for appointments');
    }



    return reasons;
  }

  /**
   * Get recommended reason for a doctor
   * @param {Object} result - Matching result
   * @param {Object} symptoms - Patient symptoms
   * @returns {string} Recommended reason
   */
  getRecommendedReason(result, symptoms) {
    const { scoreBreakdown } = result;
    
    if (scoreBreakdown.specialityMatch > 0.9) {
      return 'Perfect match for your medical needs';
    } else if (scoreBreakdown.symptomMatch > 0.8) {
      return 'Specializes in your symptoms';
    } else if (scoreBreakdown.experienceMatch > 0.8) {
      return 'Highly experienced in your condition';
    } else if (scoreBreakdown.preferenceMatch > 0.8) {
      return 'Meets your specific requirements';
    } else {
      return 'Good overall match for your needs';
    }
  }

  /**
   * Get similar patients for a doctor
   * @param {string} doctorId - Doctor ID
   * @param {number} limit - Number of similar patients
   * @returns {Array} Similar patients
   */
  async getSimilarPatients(doctorId, limit = 5) {
    try {
      // Get doctor's appointment history
      const appointments = await appointmentModel.find({ 
        docId: doctorId,
        cancelled: false 
      }).populate('userId');

      if (appointments.length === 0) return [];

      // Group patients by symptoms and conditions
      const patientGroups = new Map();
      
      appointments.forEach(appointment => {
        const patientId = appointment.userId._id.toString();
        const patientData = appointment.userData;
        
        if (!patientGroups.has(patientId)) {
          patientGroups.set(patientId, {
            patient: patientData,
            appointmentCount: 0,
            symptoms: new Set(),
            conditions: new Set()
          });
        }
        
        const group = patientGroups.get(patientId);
        group.appointmentCount++;
        
        // Extract symptoms and conditions from appointment data
        if (appointment.symptoms) {
          Object.values(appointment.symptoms).forEach(symptom => {
            if (typeof symptom === 'string') {
              group.symptoms.add(symptom.toLowerCase());
            }
          });
        }
      });

      // Find similar patients based on symptoms and conditions
      const similarPatients = [];
      
      patientGroups.forEach((group, patientId) => {
        const similarity = this.calculatePatientSimilarity(group);
        
        if (similarity > 0.5) {
          similarPatients.push({
            patient: group.patient,
            similarityScore: similarity,
            commonSymptoms: Array.from(group.symptoms),
            appointmentCount: group.appointmentCount
          });
        }
      });

      return similarPatients
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);

    } catch (error) {
      console.error('Error in getSimilarPatients:', error);
      return [];
    }
  }

  /**
   * Calculate similarity between patient groups
   * @param {Object} group - Patient group data
   * @returns {number} Similarity score
   */
  calculatePatientSimilarity(group) {
    // Calculate similarity based on symptoms and appointment frequency
    const symptomCount = group.symptoms.size;
    const appointmentFrequency = group.appointmentCount;
    
    // Normalize scores
    const symptomScore = Math.min(symptomCount / 10, 1); // Max 10 symptoms
    const frequencyScore = Math.min(appointmentFrequency / 5, 1); // Max 5 appointments
    
    return (symptomScore * 0.7) + (frequencyScore * 0.3);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new PatientMatcher(); 