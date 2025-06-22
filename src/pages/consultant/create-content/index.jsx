// src/pages/consultant/create-content/index.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConsultantHeader from "../ConsultantHeader ";
import api from "@/config/axios"; // axios instance
import { uploadFile } from "@/utils/upload"; // helper uploadFile
import { FiUser } from "react-icons/fi";

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
  const username = localStorage.getItem("name") || "Member";

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

  // Fetch courses thuộc user
  useEffect(() => {
    if (!currentUserId) return;
    api
      .get(`Course/get-courses-by-createById/${currentUserId}`)
      .then((res) => setCourses(res.data))
      .catch(console.error);
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
    // reload
    const { data } = await api.get(
      `Course/get-courses-by-createById/${currentUserId}`
    );
    setCourses(data);
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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ConsultantHeader />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow p-6 space-y-4">
          <Link
            to="/consultant/appointments"
            className="block px-3 py-2 rounded hover:bg-gray-100"
          >
            Appointments
          </Link>
          <Link
            to="/consultant/create-content"
            className="block px-3 py-2 rounded bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
          >
            Create Content
          </Link>
          <Link
            to="/consultant/blog-qa"
            className="block px-3 py-2 rounded hover:bg-gray-100"
          >
            Blog Q&A
          </Link>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 space-y-8">
          {/* Course header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Create New Course</h1>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              {showForm ? "Close Course Form" : "Open Course Form"}
            </button>
          </div>

          {/* Course form */}
          {showForm && (
            <form
              onSubmit={handleCourseSubmit}
              className="bg-white p-6 rounded shadow space-y-4"
            >
              {/* Title & Image */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleCourseChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium">Image</label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => courseImageRef.current.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                      disabled={uploadingCourseImage}
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

              {/* Description */}
              <div>
                <label className="block font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleCourseChange}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block font-medium">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleCourseChange}
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                />
              </div>

              {/* Category + Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleCourseChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium">Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleCourseChange}
                    className="w-full border rounded px-3 py-2"
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
              </div>

              {/* Duration + PassingScore */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Duration (phút)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleCourseChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium">Passing Score</label>
                  <input
                    type="number"
                    name="passingScore"
                    value={formData.passingScore}
                    onChange={handleCourseChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          )}

          {/* Material form */}
          {materialFormVisible && (
            <form
              onSubmit={handleMaterialSubmit}
              className="bg-white p-6 rounded shadow space-y-4"
            >
              {/* Thêm hàng flex để chứa tiêu đề và nút Close */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Add Material to Course #{selectedCourseId}
                </h2>
                <button
                  type="button"
                  onClick={() => setMaterialFormVisible(false)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Close Form
                </button>
              </div>

              {/* Type */}
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

              {/* Title */}
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

              {/* URL (file upload) */}
              <div>
                <label className="block font-medium">URL</label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => materialFileRef.current.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={uploadingMaterialFile}
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
                <label className="block font-medium">Description</label>
                <textarea
                  name="description"
                  value={materialData.description}
                  onChange={handleMaterialChange}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>

              {/* Sort Order */}
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
                  className="px-6 py-2 bg-indigo-600 text-white rounded"
                >
                  Add Material
                </button>
              </div>
            </form>
          )}

          {/* My Courses */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Courses</h2>
            {courses.length === 0 ? (
              <p className="text-gray-500">Bạn chưa tạo khóa học nào.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-6 rounded shadow flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Level: {c.level} • Duration: {c.duration} phút
                      </p>
                      <p className="text-gray-500 text-sm mb-4">
                        Status: {c.status}
                      </p>
                    </div>
                    <div>
                      {/* Add/Edit/View */}
                      <div className="flex space-x-2 mb-2">
                        <button
                          onClick={() => openMaterialForm(c.id)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded"
                        >
                          Add
                        </button>
                        <Link
                          to={`/consultant/course/${c.id}`}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-center"
                        >
                          View
                        </Link>
                      </div>
                      {/* nút vàng riêng dưới */}
                      <button className="w-full px-3 py-2 bg-yellow-500 text-white rounded">
                        Send content to staff
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
