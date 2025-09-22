// UserDashboard.jsx
import React from "react";
import ChatComponent from "./ChatComponent";

const UserDashboard = ({ user, selectedDoctor }) => {
  return (
    <div className="dashboard">
      {/* Other dashboard components */}

      {selectedDoctor && (
        <ChatComponent currentUser={user} doctorId={selectedDoctor._id} />
      )}
    </div>
  );
};
