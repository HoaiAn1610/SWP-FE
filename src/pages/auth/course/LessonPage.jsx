// src/pages/auth/course/LessonPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";

const LessonPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseInfo, setCourseInfo] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("video");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Lấy thông tin khóa học
        const { data: info } = await api.get(`/Course/get-course/${courseId}`);
        setCourseInfo(info);

        // 2) Lấy danh sách materials (Video + Document)
        const { data } = await api.get(
          `/courses/${courseId}/CourseMaterial/get-materials-of-course`
        );
        setMaterials(data);

        // 3) (optional) enroll user
        // await api.post(`/CourseEnrollment/courses/${courseId}/enroll`, {});
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [courseId]);

  if (loading) return <p className="text-center py-10">Đang tải khoá học…</p>;
  if (error)   return <p className="text-center text-red-500 py-10">{error}</p>;

  // 4) Tìm video đầu tiên trong materials
  const videoItem = materials.find((m) => m.type === "Video");
  // Nếu url không có "/" đầu, thêm vào để trỏ đúng public folder
  const videoSrc =
    videoItem && videoItem.url
      ? videoItem.url.startsWith("/") ? videoItem.url : `/${videoItem.url}`
      : "";

  // 5) Lọc riêng mảng Document cho tab docs
  const docs = materials.filter((m) => m.type === "Document");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        {/* Video */}
        {videoSrc ? (
          <video
            src={videoSrc}
            controls
            className="w-full aspect-video rounded-lg shadow-lg mb-6"
          />
        ) : (
          <p className="text-center text-gray-500 mb-6">
            Không có video cho khoá học này.
          </p>
        )}

        {/* Thông tin khóa học */}
        {courseInfo && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              {courseInfo.title}
            </h1>
            <p className="text-gray-600">{courseInfo.description}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          {["video", "docs", "quiz"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 ${
                activeTab === tab
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "video"
                ? "Video Content"
                : tab === "docs"
                ? "Documents"
                : "Quiz"}
            </button>
          ))}
        </div>

        {/* Nội dung từng tab */}
        <div className="bg-white p-6 rounded-lg shadow">
          {activeTab === "video" && (
            <div>
              <h2 className="text-xl font-medium mb-4">Lesson Overview</h2>
              <p className="text-gray-700">{courseInfo.content}</p>
            </div>
          )}

          {activeTab === "docs" && (
            <div className="space-y-4">
              {docs.length === 0 ? (
                <p className="text-gray-500">Chưa có tài liệu.</p>
              ) : (
                docs
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((doc) => (
                    <div key={doc.sortOrder} className="border-b pb-4">
                      <h3 className="font-semibold text-gray-800">
                        {doc.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{doc.description}</p>
                      <a
                        href={
                          doc.url.startsWith("/") ? doc.url : `/${doc.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Mở tài liệu
                      </a>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="text-center">
              <button
                onClick={() => navigate(`/course/${courseId}/quiz`)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Bắt đầu Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
