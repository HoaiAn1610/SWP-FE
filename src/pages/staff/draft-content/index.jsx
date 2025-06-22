// src/pages/staff/submitted-content/index.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/config/axios";
import { uploadFile } from "@/utils/upload"; // helper uploadFile

export default function SubmittedContentPage() {
  const [courses, setCourses] = useState([]);
  const [materialFormVisible, setMaterialFormVisible] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [materialData, setMaterialData] = useState({
    type: "",
    title: "",
    url: "",
    description: "",
    sortOrder: 0,
  });
  const [uploadingMaterialFile, setuploadingMaterialFile] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // load danh sách courses đã submit
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

  // khi bấm Add trên một card
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
    setuploadingMaterialFile(true);
    try {
      const url = await uploadFile(file, "materials");
      setMaterialData((m) => ({ ...m, url }));
    } finally {
      setuploadingMaterialFile(false);
    }
  };
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    await api.post(
      `courses/${selectedCourseId}/CourseMaterial/add-material`,
      materialData
    );
    alert("Thêm material thành công!");
    setMaterialFormVisible(false);
  };

  // gửi lên manager
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
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header và nút tạo mới */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Submitted Content</h1>
      </div>

      {/* Form Add Material đặt riêng ở đầu, chỉ hiển khi materialFormVisible=true */}
      {materialFormVisible && (
        <form
          onSubmit={handleMaterialSubmit}
          className="bg-white p-6 rounded-lg shadow mb-8 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              Add Material to Course #{selectedCourseId}
            </h2>
            <button
              type="button"
              onClick={() => setMaterialFormVisible(false)}
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Type</label>
              <select
                name="type"
                value={materialData.type}
                onChange={handleMaterialChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="" disabled>
                  -- Chọn loại --
                </option>
                <option value="Video">Video</option>
                <option value="Document">Document</option>
              </select>
            </div>
            <div>
              <label className="block font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={materialData.title}
                onChange={handleMaterialChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium">URL</label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingMaterialFile}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {uploadingMaterialFile ? "Uploading…" : "Select File…"}
              </button>
              {materialData.url && (
                <span className="text-gray-700 break-all">
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

          <div>
            <label className="block font-medium">Description</label>
            <textarea
              name="description"
              value={materialData.description}
              onChange={handleMaterialChange}
              className="w-full border rounded px-3 py-2"
              rows={2}
            />
          </div>

          <div>
            <label className="block font-medium">Sort Order</label>
            <input
              type="number"
              name="sortOrder"
              value={materialData.sortOrder}
              onChange={handleMaterialChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add Material
            </button>
          </div>
        </form>
      )}

      {/* Danh sách các course */}
      {courses.length === 0 ? (
        <p className="text-gray-500">Chưa có khóa học nào được gửi.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-white p-6 rounded-lg shadow flex flex-col justify-between"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">{c.title}</h2>
                <p className="text-gray-600 text-sm">
                  Level: {c.level} • Duration: {c.duration} phút
                </p>
                <p className="text-gray-500 text-sm">Status: {c.status}</p>
              </div>

              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => handleAddClick(c.id)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  onClick={() => navigate(`/staff/course/${c.id}`)}
                  className="flex-1 px-3 py-2 border rounded hover:bg-gray-100"
                >
                  View
                </button>
              </div>

              <button
                onClick={() => handleSubmitToManager(c.id)}
                className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Send to Manager
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
