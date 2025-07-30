/**
 * Utility functions for handling speciality conversions and mappings.
 */

// Speciality mapping from snake_case to display format
const specialityMapping = {
  "general_physician": "General Physician",
  "gynecologist": "Gynecologist",
  "dermatologist": "Dermatologist",
  "pediatrician": "Pediatrician",
  "neurologist": "Neurologist",
  "orthopedic_surgeon": "Orthopedic Surgeon",
  "cardiologist": "Cardiologist",
  "oncologist": "Oncologist",
  "endocrinologist": "Endocrinologist",
  "gastroenterologist": "Gastroenterologist",
};

// Reverse mapping from display format to snake_case
const reverseSpecialityMapping = Object.fromEntries(
  Object.entries(specialityMapping).map(([key, value]) => [value, key])
);

/**
 * Convert snake_case speciality to display format
 * @param {string} speciality - The speciality in snake_case format
 * @returns {string} The speciality in display format
 */
export const formatSpeciality = (speciality) => {
  if (!speciality) return "";
  
  // Check if it's already in display format
  if (specialityMapping[speciality]) {
    return specialityMapping[speciality];
  }
  
  // If it's already in display format, return as is
  if (reverseSpecialityMapping[speciality]) {
    return speciality;
  }
  
  // Fallback: convert snake_case to title case
  return speciality
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Convert display format speciality to snake_case
 * @param {string} speciality - The speciality in display format
 * @returns {string} The speciality in snake_case format
 */
export const toSnakeCase = (speciality) => {
  if (!speciality) return "";
  
  // Check if it's already in snake_case
  if (specialityMapping[speciality]) {
    return speciality;
  }
  
  // If it's in display format, convert to snake_case
  if (reverseSpecialityMapping[speciality]) {
    return reverseSpecialityMapping[speciality];
  }
  
  // Fallback: convert to snake_case
  return speciality.toLowerCase().replace(/\s+/g, '_');
};

/**
 * Get all available specialities in display format
 * @returns {string[]} Array of specialities in display format
 */
export const getDisplaySpecialities = () => {
  return Object.values(specialityMapping);
};

/**
 * Get all available specialities in snake_case format
 * @returns {string[]} Array of specialities in snake_case format
 */
export const getSnakeCaseSpecialities = () => {
  return Object.keys(specialityMapping);
};

/**
 * Check if a speciality exists (case-insensitive)
 * @param {string} speciality - The speciality to check
 * @returns {boolean} True if speciality exists
 */
export const isValidSpeciality = (speciality) => {
  if (!speciality) return false;
  
  const snakeCase = toSnakeCase(speciality);
  return Object.keys(specialityMapping).includes(snakeCase);
}; 