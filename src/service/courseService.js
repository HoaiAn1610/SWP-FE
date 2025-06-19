import api from "../config/axios";

/**
 * Gọi API lấy tất cả khóa học từ backend.
 * @returns {Promise<Array>} Mảng các đối tượng khóa học.
 */
export const getAllCourses = async () => {
  try {
    const response = await api.get("/Course/get-all-courses");
    return response.data; // mảng khóa học
  } catch (error) {
    console.error("Error fetching all courses:", error);
    throw error;
  }
};
