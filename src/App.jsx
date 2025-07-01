// src/App.jsx
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ChatWidget from "@/components/inquiry/ChatWidget.jsx";

import Dashboard from "./components/dashboard";
import UploadComponent from "./components/upload";
import Courses from "./pages/auth/course";
import Login from "./pages/auth/login";
import ResetPasswordPage from "./pages/auth/reser-password";
import Register from "./pages/auth/register";
import EcommerceHome from "./pages/common/home";
import SurveyPage from "@/pages/survey/SurveyPage";
import SurveySection from "@/pages/survey/surveySection";
import AssistPage from "@/pages/survey/assist";
import CrafftPage from "@/pages/survey/Crafft";

// import ProtectedRoute from "@/components/protected-route";
import LessonPage from "@/pages/auth/course/LessonPage";
import QuizPage from "@/pages/auth/course/QuizPage";
import CertificatePage from "@/pages/auth/course/CertificatePage";

import PersonalInfoLayout from "@/pages/personal-information/PersonalInfoLayout";
import MyProfilePage from "@/pages/personal-information/my-profile";

import BookingPage from "@/pages/appointmentRequest/bookingpage";
import BookingHistoryPage from "@/pages/appointmentRequest/bookingHistory";

import ManagerLayout from "@/pages/manager/ManagerLayout";
import OverviewPage from "@/pages/manager/overview";
import ApprovedPage from "@/pages/manager/approved";
import TaskQueuePage from "@/pages/manager/task-queue";
import TeamSchedulePage from "@/pages/manager/team-schedule";
import ViewManagerCoursePage from "./pages/manager/view-course-page";

import StaffLayout from "@/pages/staff/StaffLayout";
import DraftContentPage from "@/pages/staff/draft-content";
import PublishedContentPage from "@/pages/staff/published-content";
import ViewBlogPostsPage from "@/pages/staff/view-blog-posts";
import StaffInquiriesPage from "@/pages/staff/staff-Inquiries-page";
import ViewStaffCoursePage from "./pages/staff/view-course-page";

import ConsultantLayout from "@/pages/consultant/ConsultantLayout";
import AppointmentsPage from "@/pages/consultant/appointments";
import CreateContentPage from "@/pages/consultant/create-content";
import BlogQApage from "@/pages/consultant/blog-qa";
import ViewConsultantCoursePage from "./pages/consultant/view-course-page";
import Meeting from "@/pages/consultant/appointments/Meeting.jsx";

import ErrorPage from "@/components/error";
import AdminLayout from "@/pages/admin/AdminLayout";
import UserManagementPage from "@/pages/admin/user-management";
import PlatformSettingsPage from "@/pages/admin/platform-settings";
import SystemLogsPage from "@/pages/admin/system-logs";
import ProtectedRoute from "@/components/protected-route";
import { Navigate } from "react-router-dom";

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
      path: "/reset",
      element: <ResetPasswordPage />,
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
      path: "/appointments/book",
      element: <BookingPage />,
    },
    {
      path: "/appointments/history",
      element: <BookingHistoryPage />,
    },
    {
      path: "/course",
      element: <Courses />,
    },
    {
      path: "/course/:courseId/lesson",
      element: <LessonPage />,
    },
    { path: "/course/:courseId/quiz", element: <QuizPage /> },
    { path: "/course/:courseId/certificate", element: <CertificatePage /> },
    {
      path: "/account",
      element: <PersonalInfoLayout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Navigate to="MyProfilePage" replace /> },
        { path: "MyProfilePage", element: <MyProfilePage /> },
      ],
    },
    {
      path: "/survey",
      element: <SurveyPage />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <SurveySection /> },
        { path: "assist", element: <AssistPage /> },
        { path: "crafft", element: <CrafftPage /> },
      ],
    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute role="Admin">
          <AdminLayout />
        </ProtectedRoute>
      ),
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Navigate to="user-management" replace /> },
        { path: "user-management", element: <UserManagementPage /> },
        { path: "platform-settings", element: <PlatformSettingsPage /> },
        { path: "system-logs", element: <SystemLogsPage /> },
      ],
    },
    {
      path: "/consultant",
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
        { path: "course/:courseId", element: <ViewConsultantCoursePage /> },
        { path: "appointments/meeting/:id", element: <Meeting /> },
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
        { path: "approved", element: <ApprovedPage /> },
        { path: "task-queue", element: <TaskQueuePage /> },
        { path: "team-schedule", element: <TeamSchedulePage /> },
        { path: "course/:courseId", element: <ViewManagerCoursePage /> },
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
        { path: "staff-inquirie", element: <StaffInquiriesPage /> },
        { path: "course/:courseId", element: <ViewStaffCoursePage /> },
      ],
    },
  ]);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <RouterProvider router={router} />
      <ChatWidget />
    </GoogleOAuthProvider>
  );
}

export default App;
