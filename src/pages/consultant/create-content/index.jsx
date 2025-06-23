// src/pages/consultant/create-content/index.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/config/axios"; // axios instance
import { uploadFile } from "@/utils/upload"; // helper uploadFile

export default function ConsultantCreateContentPage() {
  const navigate = useNavigate();

  // --- state course form ---
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    description: "",
    content: "",
    category: "",
    level: "",
    duration: 0,
    passingScore: 0,
  });
  const [uploadingCourseImage, setUploadingCourseImage] = useState(false);
  const courseImageRef = useRef(null);

  // --- state courses ---
  const [courses, setCourses] = useState([]);
  const currentUserId = localStorage.getItem("id");

  // --- state material form ---
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
  const materialFileRef = useRef(null);

  // Fetch lại courses của user
  const reloadCourses = async () => {
    try {
      const { data } = await api.get(
        `Course/get-courses-by-createById/${currentUserId}`
      );
      setCourses(data);
    } catch (err) {
      console.error("Lỗi fetch courses:", err);
    }
  };
  useEffect(() => {
    if (currentUserId) reloadCourses();
  }, [currentUserId]);

  // Xử lý course form
  const handleCourseChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((f) => ({
      ...f,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
  const handleCourseImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCourseImage(true);
    try {
      const url = await uploadFile(file, "courses");
      setFormData((f) => ({ ...f, image: url }));
    } finally {
      setUploadingCourseImage(false);
    }
  };
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    await api.post("Course/create-course", formData);
    await reloadCourses();
    setShowForm(false);
    setFormData({
      title: "",
      image: "",
      description: "",
      content: "",
      category: "",
      level: "",
      duration: 0,
      passingScore: 0,
    });
  };

  // Xử lý material form
  const openMaterialForm = (courseId) => {
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
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    await api.post(
      `courses/${selectedCourseId}/CourseMaterial/add-material`,
      materialData
    );
    alert("Thêm material thành công!");
    setMaterialFormVisible(false);
  };

  // Submit lên Staff
  const handleSubmitToStaff = async (courseId) => {
    if (!window.confirm("Bạn có chắc muốn gửi khóa học này lên Staff không?"))
      return;
    try {
      await api.post(`/Course/${courseId}/submit-to-staff`);
      alert("Đã gửi lên Staff thành công!");
      await reloadCourses();
    } catch (err) {
      console.error("Submit to staff lỗi:", err);
      alert(
        "Có lỗi khi gửi lên Staff. Khóa học có thể không ở trạng thái Draft."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Create New Course
          </h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:scale-105 transform transition"
          >
            {showForm ? "Đóng Form" : "Mở Form"}
          </button>
        </div>

        {/* Course Form */}
        {showForm && (
          <form
            onSubmit={handleCourseSubmit}
            className="bg-white rounded-lg shadow p-6 space-y-6"
          >
            {/* Title & Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleCourseChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => courseImageRef.current.click()}
                    disabled={uploadingCourseImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:scale-105 transform transition"
                  >
                    {uploadingCourseImage ? "Uploading…" : "Select Image…"}
                  </button>
                  {formData.image && (
                    <span className="text-sm text-gray-600 break-all">
                      {formData.image}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={courseImageRef}
                  onChange={handleCourseImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Description & Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleCourseChange}
                  rows={2}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleCourseChange}
                  rows={4}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Category, Level, Duration, Passing Score */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleCourseChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleCourseChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="" disabled>
                    -- Chọn mức độ --
                  </option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (phút)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleCourseChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Score
                </label>
                <input
                  type="number"
                  name="passingScore"
                  value={formData.passingScore}
                  onChange={handleCourseChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:scale-105 transform transition"
              >
                Submit
              </button>
            </div>
          </form>
        )}

        {/* My Courses */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          {courses.filter((c) => c.workflowState === "Draft").length === 0 ? (
            <p className="text-gray-500">Bạn chưa tạo khóa học nào.</p>
          ) : (
            <div className="border border-blue-500 rounded-lg p-4 space-y-4">
              {courses
                .filter((c) => c.workflowState === "Draft")
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    {/* Left side: title + subtitle */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {c.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Level: {c.level} • Duration: {c.duration} phút
                      </p>
                    </div>
                    {/* Right side: buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openMaterialForm(c.id)}
                        className="px-4 py-1 border border-blue-500 rounded hover:bg-blue-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/consultant/course/${c.id}`)}
                        className="px-4 py-1 bg-blue-500 text-white rounded hover:opacity-90 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleSubmitToStaff(c.id)}
                        className="px-4 py-1 bg-yellow-500 text-white rounded hover:opacity-90 transition"
                      >
                        Sent to Staff
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>

      {/* Material Form Modal */}
      {materialFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <form
            onSubmit={handleMaterialSubmit}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg space-y-4"
          >
            {/* Header */}
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
                  onClick={() => materialFileRef.current.click()}
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
                type="file"
                accept="*/*"
                ref={materialFileRef}
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
    </div>
  );
}
