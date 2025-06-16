import React from "react";
import { Outlet } from "react-router-dom";

function ProtectedRoute({ role }) {
  const userRole = localStorage.getItem("role");

  if (role !== userRole) return <h1>Access Deny</h1>;

  return <Outlet />;
}

export default ProtectedRoute;
