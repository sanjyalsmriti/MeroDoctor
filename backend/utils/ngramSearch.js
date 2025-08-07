/**
 * N-gram Search Algorithm for Doctor-Patient Matching
 * Implements N-gram indexing, fuzzy matching, and similarity scoring
 * 
 * @module utils/ngramSearch
 */

import Doctor from '../models/doctorModel.js';
import User from '../models/userModel.js';
import appointmentModel from '../models/appointmentModel.js';

/**
 * N-gram Search Engine Class
 * Handles doctor search and patient matching using N-gram algorithms
 */
class NgramSearchEngine {
  constructor() {
    this.ngramIndex = new Map();
    this.doctorIndex = new Map();
    this.patientIndex = new Map();
    this.ngramSize = 3; // Trigram by default
    this.similarityThreshold = 0.6;
    this.cache = new Map();
    this.cacheExpiry = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Generate N-grams from text
   * @param {string} text - Input text
   * @param {number} n - N-gram size (default: 3 for trigrams)
   * @returns {Array} Array of N-grams
   */
  generateNgrams(text, n = this.ngramSize) {
    if (!text || text.length < n) return [];
    
    const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, '');
    const ngrams = [];
    
    for (let i = 0; i <= normalizedText.length - n; i++) {
      ngrams.push(normalizedText.substring(i, i + n));
    }
    
    return ngrams;
  }

  /**
   * Build N-gram index for doctors
   * @param {Array} doctors - Array of doctor objects
   */
  buildDoctorIndex(doctors) {
    this.doctorIndex.clear();
    this.ngramIndex.clear();

    doctors.forEach(doctor => {
      const doctorId = doctor._id.toString();
      const searchableText = this.getDoctorSearchableText(doctor);
      
      // Generate n-grams for different n values
      const ngrams = {
        2: this.generateNgrams(searchableText, 2), // Bigrams
        3: this.generateNgrams(searchableText, 3), // Trigrams
        4: this.generateNgrams(searchableText, 4)  // 4-grams
      };

      // Store doctor data
      this.doctorIndex.set(doctorId, {
        doctor,
        ngrams,
        searchableText
      });

      // Build inverted index
      Object.entries(ngrams).forEach(([n, gramList]) => {
        gramList.forEach(gram => {
          if (!this.ngramIndex.has(gram)) {
            this.ngramIndex.set(gram, new Set());
          }
          this.ngramIndex.get(gram).add(doctorId);
        });
      });
    });
  }

  /**
   * Get searchable text for a doctor
   * @param {Object} doctor - Doctor object
   * @returns {string} Combined searchable text
   */
  getDoctorSearchableText(doctor) {
    return [
      doctor.name,
      doctor.speciality,
      doctor.degree,
      doctor.experience,
      doctor.about,
      doctor.address?.line1 || '',
      doctor.address?.line2 || ''
    ].join(' ').toLowerCase();
  }

  /**
   * Calculate Jaccard similarity between two sets
   * @param {Set} set1 - First set
   * @param {Set} set2 - Second set
   * @returns {number} Jaccard similarity (0-1)
   */
  calculateJaccardSimilarity(set1, set2) {
    if (set1.size === 0 && set2.size === 0) return 1;
    if (set1.size === 0 || set2.size === 0) return 0;

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Calculate Dice similarity between two sets
   * @param {Set} set1 - First set
   * @param {Set} set2 - Second set
   * @returns {number} Dice similarity (0-1)
   */
  calculateDiceSimilarity(set1, set2) {
    if (set1.size === 0 && set2.size === 0) return 1;
    if (set1.size === 0 || set2.size === 0) return 0;

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    return (2 * intersection.size) / (set1.size + set2.size);
  }

  /**
   * Calculate cosine similarity between two sets
   * @param {Set} set1 - First set
   * @param {Set} set2 - Second set
   * @returns {number} Cosine similarity (0-1)
   */
  calculateCosineSimilarity(set1, set2) {
    if (set1.size === 0 && set2.size === 0) return 1;
    if (set1.size === 0 || set2.size === 0) return 0;

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    return intersection.size / Math.sqrt(set1.size * set2.size);
  }

  /**
   * Search doctors using N-gram algorithm
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @param {number} limit - Number of results
   * @returns {Array} Ranked search results
   */
  async searchDoctors(query, filters = {}, limit = 20) {
    try {
      const cacheKey = `search_${query}_${JSON.stringify(filters)}_${limit}`;
      
      // Check cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          return cached.data;
        }
      }

      // Get all doctors if index is empty
      if (this.doctorIndex.size === 0) {
        const doctors = await Doctor.find({ available: true }).select('-password');
        this.buildDoctorIndex(doctors);
      }

      // Generate query n-grams
      const queryNgrams = {
        2: this.generateNgrams(query, 2),
        3: this.generateNgrams(query, 3),
        4: this.generateNgrams(query, 4)
      };

      // Find candidate doctors using n-gram index
      const candidates = this.findCandidates(queryNgrams);
      
      // Calculate similarity scores
      const scoredResults = this.calculateSimilarityScores(queryNgrams, candidates);
      
      // Apply filters
      const filteredResults = this.applyFilters(scoredResults, filters);
      
      // Sort by score and limit results
      const finalResults = filteredResults
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit)
        .map(result => ({
          ...result.doctor.toObject(),
          similarityScore: result.similarityScore,
          matchReasons: this.getMatchReasons(result, query),
          ngramMatches: result.ngramMatches
        }));

      // Cache results
      this.cache.set(cacheKey, {
        data: finalResults,
        timestamp: Date.now()
      });

      return finalResults;

    } catch (error) {
      console.error('Error in searchDoctors:', error);
      throw error;
    }
  }

  /**
   * Find candidate doctors using n-gram index
   * @param {Object} queryNgrams - Query n-grams
   * @returns {Set} Set of candidate doctor IDs
   */
  findCandidates(queryNgrams) {
    const candidates = new Set();
    
    Object.values(queryNgrams).flat().forEach(gram => {
      if (this.ngramIndex.has(gram)) {
        this.ngramIndex.get(gram).forEach(doctorId => {
          candidates.add(doctorId);
        });
      }
    });

    return candidates;
  }

  /**
   * Calculate similarity scores for candidates
   * @param {Object} queryNgrams - Query n-grams
   * @param {Set} candidates - Candidate doctor IDs
   * @returns {Array} Scored results
   */
  calculateSimilarityScores(queryNgrams, candidates) {
    const results = [];

    candidates.forEach(doctorId => {
      const doctorData = this.doctorIndex.get(doctorId);
      if (!doctorData) return;

      const doctorNgrams = doctorData.ngrams;
      let totalScore = 0;
      let ngramMatches = 0;

      // Calculate weighted similarity for different n-gram sizes
      Object.entries(queryNgrams).forEach(([n, queryGramList]) => {
        if (queryGramList.length === 0) return;

        const querySet = new Set(queryGramList);
        const doctorSet = new Set(doctorNgrams[n] || []);
        
        // Use different similarity metrics for different n-gram sizes
        let similarity;
        if (n === '2') {
          similarity = this.calculateJaccardSimilarity(querySet, doctorSet);
        } else if (n === '3') {
          similarity = this.calculateDiceSimilarity(querySet, doctorSet);
        } else {
          similarity = this.calculateCosineSimilarity(querySet, doctorSet);
        }

        // Weight by n-gram size (smaller n-grams get higher weight for fuzzy matching)
        const weight = n === '2' ? 0.4 : n === '3' ? 0.35 : 0.25;
        totalScore += similarity * weight;
        ngramMatches += querySet.size;
      });

      // Additional scoring factors
      const additionalScore = this.calculateAdditionalScore(doctorData.doctor, queryNgrams);
      totalScore += additionalScore * 0.2; // 20% weight for additional factors

      results.push({
        doctor: doctorData.doctor,
        similarityScore: Math.min(totalScore, 1),
        ngramMatches
      });
    });

    return results;
  }

  /**
   * Calculate additional scoring factors
   * @param {Object} doctor - Doctor object
   * @param {Object} queryNgrams - Query n-grams
   * @returns {number} Additional score
   */
  calculateAdditionalScore(doctor, queryNgrams) {
    let score = 0;
    const queryText = Object.values(queryNgrams).flat().join(' ');

    // Name matching (highest priority)
    if (doctor.name.toLowerCase().includes(queryText) || 
        queryText.includes(doctor.name.toLowerCase())) {
      score += 0.8;
    }

    // Speciality matching
    if (doctor.speciality.toLowerCase().includes(queryText) || 
        queryText.includes(doctor.speciality.toLowerCase())) {
      score += 0.6;
    }

    // Experience matching
    if (doctor.experience.toLowerCase().includes(queryText)) {
      score += 0.4;
    }

    // Availability bonus
    if (doctor.available) {
      score += 0.1;
    }



    return Math.min(score, 1);
  }

  /**
   * Apply filters to search results
   * @param {Array} results - Search results
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered results
   */
  applyFilters(results, filters) {
    let filtered = results;

    if (filters.speciality) {
      filtered = filtered.filter(result => 
        result.doctor.speciality.toLowerCase().includes(filters.speciality.toLowerCase())
      );
    }

    if (filters.minFees !== undefined) {
      filtered = filtered.filter(result => result.doctor.fees >= filters.minFees);
    }

    if (filters.maxFees !== undefined) {
      filtered = filtered.filter(result => result.doctor.fees <= filters.maxFees);
    }

    if (filters.minExperience) {
      filtered = filtered.filter(result => {
        const yearsMatch = result.doctor.experience.match(/(\d+)\s*years?/i);
        return yearsMatch && parseInt(yearsMatch[1]) >= filters.minExperience;
      });
    }

    if (filters.available !== undefined) {
      filtered = filtered.filter(result => result.doctor.available === filters.available);
    }



    return filtered;
  }

  /**
   * Get match reasons for search results
   * @param {Object} result - Search result
   * @param {string} query - Search query
   * @returns {Array} Match reasons
   */
  getMatchReasons(result, query) {
    const reasons = [];
    const queryLower = query.toLowerCase();

    if (result.similarityScore > 0.8) {
      reasons.push('Excellent match with your search');
    } else if (result.similarityScore > 0.6) {
      reasons.push('Good match with your search');
    }

    if (result.doctor.name.toLowerCase().includes(queryLower)) {
      reasons.push('Name matches your search');
    }

    if (result.doctor.speciality.toLowerCase().includes(queryLower)) {
      reasons.push('Speciality matches your search');
    }

    if (result.doctor.available) {
      reasons.push('Currently available for appointments');
    }

    if (result.ngramMatches > 5) {
      reasons.push('Multiple relevant matches found');
    }

    return reasons;
  }

  /**
   * Get search suggestions using N-grams
   * @param {string} query - Partial query
   * @param {number} limit - Number of suggestions
   * @returns {Array} Search suggestions
   */
  async getSearchSuggestions(query, limit = 5) {
    try {
      if (this.doctorIndex.size === 0) {
        const doctors = await Doctor.find({ available: true }).select('-password');
        this.buildDoctorIndex(doctors);
      }

      const suggestions = new Set();
      const queryNgrams = this.generateNgrams(query, 2); // Use bigrams for suggestions

      queryNgrams.forEach(gram => {
        if (this.ngramIndex.has(gram)) {
          this.ngramIndex.get(gram).forEach(doctorId => {
            const doctorData = this.doctorIndex.get(doctorId);
            if (doctorData) {
              const searchableText = doctorData.searchableText;
              const words = searchableText.split(' ');
              
              words.forEach(word => {
                if (word.includes(query.toLowerCase()) && word.length > 2) {
                  suggestions.add(word.charAt(0).toUpperCase() + word.slice(1));
                }
              });
            }
          });
        }
      });

      return Array.from(suggestions).slice(0, limit);

    } catch (error) {
      console.error('Error in getSearchSuggestions:', error);
      return [];
    }
  }

  /**
   * Find similar doctors using N-gram similarity
   * @param {string} doctorId - Reference doctor ID
   * @param {number} limit - Number of similar doctors
   * @returns {Array} Similar doctors
   */
  async findSimilarDoctors(doctorId, limit = 5) {
    try {
      if (this.doctorIndex.size === 0) {
        const doctors = await Doctor.find({ available: true }).select('-password');
        this.buildDoctorIndex(doctors);
      }

      const referenceDoctor = this.doctorIndex.get(doctorId);
      if (!referenceDoctor) return [];

      const similarDoctors = [];

      this.doctorIndex.forEach((doctorData, id) => {
        if (id === doctorId) return;

        const similarity = this.calculateDoctorSimilarity(referenceDoctor, doctorData);
        
        if (similarity > this.similarityThreshold) {
          similarDoctors.push({
            doctor: doctorData.doctor,
            similarityScore: similarity
          });
        }
      });

      return similarDoctors
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);

    } catch (error) {
      console.error('Error in findSimilarDoctors:', error);
      return [];
    }
  }

  /**
   * Calculate similarity between two doctors
   * @param {Object} doctor1 - First doctor data
   * @param {Object} doctor2 - Second doctor data
   * @returns {number} Similarity score
   */
  calculateDoctorSimilarity(doctor1, doctor2) {
    const text1 = doctor1.searchableText;
    const text2 = doctor2.searchableText;

    const ngrams1 = new Set(this.generateNgrams(text1, 3));
    const ngrams2 = new Set(this.generateNgrams(text2, 3));

    return this.calculateDiceSimilarity(ngrams1, ngrams2);
  }

  /**
   * Get N-gram statistics for analysis
   * @returns {Object} N-gram statistics
   */
  getNgramStatistics() {
    const stats = {
      totalDoctors: this.doctorIndex.size,
      totalNgrams: this.ngramIndex.size,
      ngramDistribution: {},
      mostCommonNgrams: []
    };

    // Count n-gram distribution
    this.ngramIndex.forEach((doctorSet, gram) => {
      const count = doctorSet.size;
      if (!stats.ngramDistribution[count]) {
        stats.ngramDistribution[count] = 0;
      }
      stats.ngramDistribution[count]++;
    });

    // Find most common n-grams
    const sortedNgrams = Array.from(this.ngramIndex.entries())
      .sort(([,a], [,b]) => b.size - a.size)
      .slice(0, 10);

    stats.mostCommonNgrams = sortedNgrams.map(([gram, doctorSet]) => ({
      gram,
      frequency: doctorSet.size
    }));

    return stats;
  }

  /**
   * Clear cache and rebuild index
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Rebuild the entire index
   * @param {Array} doctors - Array of doctor objects
   */
  rebuildIndex(doctors) {
    this.clearCache();
    this.buildDoctorIndex(doctors);
  }
}

export default new NgramSearchEngine(); 