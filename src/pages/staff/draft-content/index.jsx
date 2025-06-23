// src/pages/staff/submitted-content/index.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/config/axios";
import { uploadFile } from "@/utils/upload";

export default function SubmittedContentPage() {
  const navigate = useNavigate();

  // state courses
  const [courses, setCourses] = useState([]);

  // state material form
  const [materialFormVisible, setMaterialFormVisible] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [materialData, setMaterialData] = useState({
    type: "",
    title: "",
    url: "",
    description: "",
    sortOrder: 0,
  });
  const [uploadingMaterialFile, setUploadingMaterialFile] = useState(false);
  const fileInputRef = useRef(null);

  // load courses đã submit
  const reloadCourses = async () => {
    try {
      const { data } = await api.get("/Course/get-all-courses");
      const submitted = data.filter(
        (c) => c.workflowState === "SubmittedToStaff"
      );
      setCourses(submitted);
    } catch (err) {
      console.error("Lỗi fetch courses:", err);
    }
  };
  useEffect(() => {
    reloadCourses();
  }, []);

  // mở form thêm material
  const handleAddClick = (courseId) => {
    setSelectedCourseId(courseId);
    setMaterialFormVisible(true);
    setMaterialData({
      type: "",
      title: "",
      url: "",
      description: "",
      sortOrder: 0,
    });
  };

  // thay đổi field material
  const handleMaterialChange = (e) => {
    const { name, value, type } = e.target;
    setMaterialData((m) => ({
      ...m,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // chọn file và upload
  const handleMaterialFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingMaterialFile(true);
    try {
      const url = await uploadFile(file, "materials");
      setMaterialData((m) => ({ ...m, url }));
    } finally {
      setUploadingMaterialFile(false);
    }
  };

  // submit material
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    await api.post(
      `courses/${selectedCourseId}/CourseMaterial/add-material`,
      materialData
    );
    alert("Thêm material thành công!");
    setMaterialFormVisible(false);
  };

  // gửi lên Manager
  const handleSubmitToManager = async (courseId) => {
    if (!window.confirm("Bạn có chắc muốn gửi lên Manager không?")) return;
    try {
      await api.post(`/Course/${courseId}/submit-to-manager`);
      alert("Đã gửi lên Manager thành công!");
      reloadCourses();
    } catch (err) {
      console.error("Submit to Manager lỗi:", err);
      alert("Gửi lên Manager thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Submitted Content
          </h1>
        </div>

        {/* Material Form Modal */}
        {materialFormVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
            <form
              onSubmit={handleMaterialSubmit}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg space-y-4"
            >
              {/* Header form */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Add Material to Course #{selectedCourseId}
                </h2>
                <button
                  type="button"
                  onClick={() => setMaterialFormVisible(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={materialData.type}
                  onChange={handleMaterialChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="" disabled>
                    -- Chọn loại --
                  </option>
                  <option value="Video">Video</option>
                  <option value="Document">Document</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={materialData.title}
                  onChange={handleMaterialChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL (file)
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploadingMaterialFile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:scale-105 transform transition"
                  >
                    {uploadingMaterialFile ? "Uploading…" : "Select File…"}
                  </button>
                  {materialData.url && (
                    <span className="text-sm text-gray-600 break-all">
                      {materialData.url}
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  onChange={handleMaterialFileSelect}
                  className="hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={materialData.description}
                  onChange={handleMaterialChange}
                  rows={2}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={materialData.sortOrder}
                  onChange={handleMaterialChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:scale-105 transform transition"
                >
                  Add Material
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danh sách courses */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Danh sách khóa học
          </h2>
          {courses.length === 0 ? (
            <p className="text-gray-500">Chưa có khóa học nào được gửi.</p>
          ) : (
            <div className="border border-blue-500 rounded-lg p-4 space-y-4">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  {/* Left: title + meta */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {c.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Level: {c.level} • Duration: {c.duration} phút
                    </p>
                  </div>
                  {/* Right: buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddClick(c.id)}
                      className="px-4 py-1 border border-blue-500 rounded hover:bg-blue-50 transition"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => navigate(`/staff/course/${c.id}`)}
                      className="px-4 py-1 bg-blue-500 text-white rounded hover:opacity-90 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleSubmitToManager(c.id)}
                      className="px-4 py-1 bg-yellow-500 text-white rounded hover:opacity-90 transition"
                    >
                      Send to Manager
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
