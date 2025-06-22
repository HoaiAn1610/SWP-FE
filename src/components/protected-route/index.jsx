// src/components/protected-route.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ role, children }) {
  const userRole = localStorage.getItem("role");
  const location = useLocation();

  if (!userRole) {
    // Chưa login thì chuyển về /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userRole !== role) {
    // Không đúng role thì khóa lại
    return <h1>Access Deny</h1>;
  }

  // Khi role match, render chính xác cái children
  return <>{children}</>;
}

export default ProtectedRoute;
