/**
 * DoctorsList page component for admin panel.
 * Displays a list of all doctors with their details and availability toggle.
 * Fetches doctors on mount and allows changing availability.
 *
 * @module pages/Admin/DoctorsList
 */

import { useContext } from "react";
import { useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorsList = () => {
  const { doctors, token, getAllDoctors, changeAvailability } =
    useContext(AdminContext);

  /**
   * useEffect hook to fetch all doctors when the token is available.
   *
   * @function
   * @returns {void}
   */
  useEffect(() => {
    if (token) {
      getAllDoctors();
    }
  }, [token]);

  /**
   * Renders the doctors list with image, name, speciality, and availability toggle.
   *
   * @returns {JSX.Element} The rendered doctors list UI.
   */
  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">Doctors List</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {doctors.map((item, index) => (
          <div
            className="border border-indigo-200  rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            key={index}
          >
            <img
              className="bg-indigo-50 hover-bg-primary transition-all duration-500"
              src={item.image}
              alt=""
            />
            <div className="p-4">
              <p className="text-neutral-800 text-lg font-medium">
                {item.name}
              </p>
              <p className="text-zinc-600 text-sm">{item.speciality}</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <input
                  onChange={() => changeAvailability(item._id)}
                  type="checkbox"
                  checked={item.available}
                  readOnly={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
