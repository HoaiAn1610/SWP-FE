// src/service/quizService.js
import api from "@/config/axios";

export async function getQuizByCourse(courseId) {
  // API giả định: GET /api/courses/{courseId}/Quiz/get-quiz
  const { data } = await api.get(`/courses/${courseId}/Quiz/get-quiz`);
  return data;
}
