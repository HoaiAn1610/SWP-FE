// src/service/courseService.js
import api from "../config/axios";

export const getAllCourses = async () => {
  const { data } = await api.get("/Course/get-all-courses");
  // Chỉ giữ lại những khóa có status === "Approved"
  return Array.isArray(data)
    ? data.filter((course) => course.status === "Published")
    : [];
};

export const getCoursesByLevel = async (level) => {
  const { data } = await api.get(`/Course/get-course-by-level/${level}`);
  return Array.isArray(data)
    ? data.filter((course) => course.status === "Published")
    : [];
};

export const getCoursesByCategory = async (category) => {
  const { data } = await api.get(`/Course/get-courses-by-category/${category}`);
  return Array.isArray(data)
    ? data.filter((course) => course.status === "Published")
    : [];
};

export default {
  getAllCourses,
  getCoursesByLevel,
  getCoursesByCategory,
};
