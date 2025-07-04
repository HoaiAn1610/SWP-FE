import axios from "axios";

const api = axios.create({
  baseURL: "/api", // ← đổi từ "http://localhost:5165/api/" thành "/api/"
  withCredentials: true, // nếu bạn cần gửi cookie/token
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchCourses = () =>
  api.get("/courses").then((response) => response.data);
export default api;
