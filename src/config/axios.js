import axios from "axios";

const api = axios.create({
  baseURL: "/api/",       // ← đổi từ "http://localhost:5165/api/" thành "/api/"
  withCredentials: true,  // nếu bạn cần gửi cookie/token
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
