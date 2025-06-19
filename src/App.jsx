// src/App.jsx
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Dashboard from "./components/dashboard";
import UploadComponent from "./components/upload";
import Courses from "./pages/auth/course";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import EcommerceHome from "./pages/common/home";
import ProtectedRoute from "./components/protected-route";

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
        <ProtectedRoute role="Consultant">
          <ConsultantLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="appointments" replace /> },
        { path: "appointments", element: <AppointmentsPage /> },
        { path: "create-content", element: <CreateContentPage /> },
        { path: "blog-qa", element: <BlogQApage /> },
      ],
    },
    {
      path: "/manager",
      element: (
        <ProtectedRoute role="Manager">
          <ManagerLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="overview" replace /> },
        { path: "overview", element: <OverviewPage /> },
        { path: "analytics", element: <AnalyticsPage /> },
        { path: "task-queue", element: <TaskQueuePage /> },
        { path: "team-schedule", element: <TeamSchedulePage /> },
      ],
    },
    {
      path: "/staff",
      element: (
        <ProtectedRoute role="Staff">
          <StaffLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="draft-content" replace /> },
        { path: "draft-content", element: <DraftContentPage /> },
        { path: "published-content", element: <PublishedContentPage /> },
        { path: "view-blog-posts", element: <ViewBlogPostsPage /> },
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
