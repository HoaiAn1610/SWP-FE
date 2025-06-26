// src/pages/survey/SurveyPage.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function SurveyPage() {
  return (
    // Outlet sẽ lấy index element (SurveySection) hoặc AssistPage/CraftPage tùy URL
    <Outlet />
  );
}
