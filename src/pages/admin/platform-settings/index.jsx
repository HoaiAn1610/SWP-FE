// src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import api from "@/config/axios";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"]; // Các màu cho biểu đồ

export default function DashboardPage() {
  const [userCount, setUserCount] = useState(0); // Tổng số người dùng
  const [enrollmentCount, setEnrollmentCount] = useState(0); // Tổng số lượt đăng ký khóa học
  const [passedCount, setPassedCount] = useState(0); // Tổng số lượt hoàn thành khóa học
  const [surveyCounts, setSurveyCounts] = useState({}); // Số lượng khảo sát đã nộp theo từng loại
  const [loading, setLoading] = useState(true); // Trạng thái đang tải
  const [error, setError] = useState(null); // Trạng thái lỗi

  // Danh sách ID và tên khảo sát sẽ hiển thị
  const surveys = [
    { id: 3, label: "CRAFFT" },
    { id: 5, label: "ASSIST" },
  ];

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        // Lấy dữ liệu số lượng từ API
        const [userRes, enrollRes, passedRes] = await Promise.all([
          api.get("/Admin/user-count"),
          api.get("/Admin/course-enrollment-count"),
          api.get("/Admin/passed-course-count"),
        ]);
        setUserCount(userRes.data.userCount);
        setEnrollmentCount(enrollRes.data.courseEnrollmentCount);
        setPassedCount(passedRes.data.passedCourseCount);

        // Lấy dữ liệu số lượng khảo sát đã nộp
        const surveyData = await Promise.all(
          surveys.map((s) =>
            api
              .get(`/Admin/survey-submission-count/${s.id}`)
              .then((res) => ({
                id: s.id,
                count: res.data.surveySubmissionCount,
              }))
          )
        );
        const countsMap = {};
        surveyData.forEach(({ id, count }) => (countsMap[id] = count));
        setSurveyCounts(countsMap);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading)
    return <p className="text-center py-10">Đang tải dashboard...</p>;
  if (error)
    return <p className="text-center py-10 text-red-500">Lỗi: {error}</p>;

  // Tổng số khảo sát đã nộp
  const totalSurveySubmissions = surveys.reduce(
    (sum, s) => sum + (surveyCounts[s.id] || 0),
    0
  );

  // Dữ liệu cho biểu đồ tròn (Pie Chart)
  const pieData = surveys.map((s, idx) => ({
    name: s.label,
    value: surveyCounts[s.id] || 0,
  }));

  // Dữ liệu cho biểu đồ cột (Bar Chart)
  const barData = [
    { metric: "Lượt đăng ký", count: enrollmentCount },
    { metric: "Khóa học đã hoàn thành", count: passedCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Bảng điều khiển quản trị</h1>

        {/* Các thẻ tóm tắt số liệu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">Tổng số người dùng</p>
            <p className="text-3xl font-semibold mt-2">{userCount}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">Tổng khảo sát đã nộp</p>
            <p className="text-3xl font-semibold mt-2">
              {totalSurveySubmissions}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">Tổng lượt đăng ký</p>
            <p className="text-3xl font-semibold mt-2">{enrollmentCount}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">Khóa học đã hoàn thành</p>
            <p className="text-3xl font-semibold mt-2">{passedCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biểu đồ tròn: Phân loại khảo sát đã nộp */}
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Phân loại khảo sát đã nộp
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ cột: Đăng ký vs Hoàn thành */}
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Đăng ký vs Hoàn thành
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <ReTooltip />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
