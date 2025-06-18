// src/App.jsx
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Dashboard from "./component/dashboard";
import UploadComponent from "./component/upload";
import Courses from "./pages/course";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import ManageProduct from "./pages/admin/manage-product";
import ReportPage from "./pages/admin/report";
import EcommerceHome from "./pages/common/home";
import ProtectedRoute from "./component/protected-route";

function App() {
  // Lấy Google Client ID từ .env
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const router = createBrowserRouter([
    {
      path: "/",
      element: <EcommerceHome />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/course",
      element: <Courses />,
    },
    {
      path: "/adminDashboard",
      element: (
        <ProtectedRoute role={"Admin"}>
          <Dashboard />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "manage-product",
          element: <ManageProduct />,
        },
        {
          path: "",
          element: <ReportPage />,
        },
      ],
    },
  ]);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}

export default App;
