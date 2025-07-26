/**
 * React context for general application-wide utilities and configuration.
 * Provides currency, date formatting, and age calculation helpers to child components.
 *
 * @module AppContext
 */

import { createContext } from "react";

/**
 * Context object for app-wide features.
 * @type {import('react').Context<any>}
 */
export const AppContext = createContext();

/**
 * AppContextProvider wraps the app and provides general utilities and config via context.
 *
 * @component
 * @param {object} props - React props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The context provider with app-wide utilities and config.
 */
const AppContextProvider = (props) => {
  /**
   * Default currency symbol for the application.
   * @type {string}
   */
  const currency = "Rs"; // Default currency, can be changed as needed

  /**
   * Calculates age in years from a given birth date string.
   *
   * @function calculateAge
   * @param {string|Date} birthDate - The birth date to calculate age from
   * @returns {number} The calculated age in years
   */
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  /**
   * Formats a date string into 'DD MMM YYYY' format (e.g., '11 Aug 2024').
   *
   * @function slotDateFormat
   * @param {string|Date} date - The date to format
   * @returns {string} The formatted date string
   */
  const slotDateFormat = (date) => {
    // in  day month 3 and year format
    // e.g. 11 Aug 2024
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(date).toLocaleDateString("en-GB", options);
  };

  /**
   * Value provided to AppContext consumers.
   * @typedef {object} AppContextValue
   * @property {string} backendUrl - Backend API base URL
   * @property {function} calculateAge - Calculates age from birth date
   * @property {function} slotDateFormat - Formats date for slots
   * @property {string} currency - Currency symbol
   */

  const value = {
    backendUrl: "http://localhost:4000/", // Replace with your backend URL
    calculateAge,
    slotDateFormat,
    currency,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
export default AppContextProvider;
