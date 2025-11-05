import React from "react";
import { Navigate } from "react-router-dom";

// Checks if "user" is present in sessionStorage
const ProtectedRoute = ({ children }) => {
  const user = sessionStorage.getItem("user");
  if (!user) {
    return <Navigate to="/auth" replace />; // Redirect to login if not authenticated
  }
  return children;
};
export default ProtectedRoute;
