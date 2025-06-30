// src/pages/common/home/EcommerceHome.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/config/axios";
import Header from "@/components/header";
import CourseList from "@/components/courses/CourseList";
import CourseDetailOverlay from "@/components/courses/CourseDetailOverlay";
import SurveySection from "@/pages/common/survey";
import ChatWidget from "@/components/inquiry/ChatWidget.jsx";
import { getAllCourses } from "@/service/courseService";

export default function EcommerceHome() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // overlay detail
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 1) Lấy toàn bộ courses
  useEffect(() => {
    setLoading(true);
    getAllCourses()
      .then((data) => setCourses(data))
      .catch((err) => setError(err.message || "Error loading courses"))
      .finally(() => setLoading(false));
  }, []);

  // 2) Lấy enrollments nếu user đã login
  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (!userId) return;
    api
      .get(`/CourseEnrollment/users/${userId}/enrollments`)
      .then(({ data }) => setEnrollments(data))
      .catch((err) => {
        console.error("Lỗi fetch enrollments:", err);
        setEnrollments([]);
      });
  }, []);

  // chỉ show 3 khóa đầu làm Featured
  const featured = courses.slice(0, 3);

  // build helper: danh sách id đã enroll và map status
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const statusMap = enrollments.reduce((m, e) => {
    m[e.courseId] = e.status; // "Enrolled" hoặc "Completed"
    return m;
  }, {});

  // khi click Learn More → mở overlay
  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  if (loading) return <p className="text-center py-10">Loading…</p>;
  if (error)
    return <p className="text-center text-red-500 py-10">Error: {error}</p>;

  return (
    <>
      <Header />

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">
            Featured Courses
          </h2>

          <CourseList
            courses={featured}
            enrolledCourseIds={enrolledCourseIds}
            statusMap={statusMap}
            onSelect={handleSelectCourse}
          />

          {courses.length > 3 && (
            <div className="flex justify-center mt-8">
              <Link
                to="/course"
                className="
                  inline-block
                  bg-indigo-600 text-white
                  px-8 py-3
                  rounded-full
                  hover:bg-indigo-700
                  transition
                "
              >
                View All Courses
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Overlay chi tiết mỗi course */}
      {showModal && selectedCourse && (
        <CourseDetailOverlay
          course={selectedCourse}
          status={statusMap[selectedCourse.id]}
          onClose={handleCloseModal}
        />
      )}

      {/* Mục Prevention ngay dưới header */}
      <SurveySection />

      {/* ==== Inquiry Chat Widget ==== */}
      <ChatWidget />
    </>
  );
}
