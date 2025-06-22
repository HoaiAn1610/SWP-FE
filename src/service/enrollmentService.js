import api from "@/config/axios";

export const getUserEnrollments = async (memberId) => {
  const { data } = await api.get(`/CourseEnrollment/users/${memberId}/enrollments`);
  // data = [{ courseId: 1, ...}, { courseId: 4, ...}, …]
  return data;
};
