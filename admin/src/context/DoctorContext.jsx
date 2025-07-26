/**
 * React context for doctor-related state and actions in the admin panel.
 * Intended to provide doctor-specific utilities and state to child components.
 *
 * @module DoctorContext
 */

import { createContext } from "react";

/**
 * Context object for doctor features.
 * @type {import('react').Context<any>}
 */
export const DoctorContext = createContext();

/**
 * DoctorContextProvider wraps the app and provides doctor state and actions via context.
 *
 * @component
 * @param {object} props - React props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The context provider with doctor state and actions.
 */
const DoctorContextProvider = (props) => {
  const value = {
    // Define any state or functions you want to provide to the context
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

/**
 * Value provided to DoctorContext consumers.
 * @typedef {object} DoctorContextValue
 * // Define properties as you add them to the context value
 */

export default DoctorContextProvider;
