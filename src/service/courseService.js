import api from "../config/axios";

export const getAllCourses = async () => {
  const { data } = await api.get("Course/get-all-courses");
  return data;
};

export const getCoursesByLevel = async (level) => {
  const { data } = await api.get(`Course/get-course-by-level/${level}`);
  return data;
};

export const getCoursesByCategory = async (category) => {
  const { data } = await api.get(`Course/get-courses-by-category/${category}`);
  return data;
};

export default { getAllCourses, getCoursesByLevel, getCoursesByCategory };
