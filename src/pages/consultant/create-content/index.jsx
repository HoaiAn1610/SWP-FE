// src/pages/consultant/create-content/index.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ConsultantHeader from "../ConsultantHeader ";
import api from "@/config/axios"; // axios instance
import { uploadFile } from "@/utils/upload"; // helper uploadFile

export default function ConsultantCreateContentPage() {
  // State form
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
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const fileInputRef = useRef(null);

  // ID consultant đang đăng nhập
  const currentUserId = localStorage.getItem("id");

  // Lấy courses do chính consultant đó tạo
  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!currentUserId) return;
      try {
        const { data } = await api.get(
          `Course/get-courses-by-createById/${currentUserId}`
        );
        setCourses(data);
      } catch (err) {
        console.error("Fetch courses lỗi:", err);
      }
    };
    fetchMyCourses();
  }, [currentUserId]);

  // Xử lý input text/number
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Chọn file và upload
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "courses");
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      console.error("Upload lỗi:", err);
      alert("Không upload được hình ảnh");
    } finally {
      setUploading(false);
    }
  };

  // Submit tạo course
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("Course/create-course", formData);
      alert("Tạo khóa học thành công!");
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
      setShowForm(false);
      // Reload courses
      const { data } = await api.get(
        `Course/get-courses-by-createById/${currentUserId}`
      );
      setCourses(data);
    } catch (err) {
      console.error("Create course lỗi:", err);
      alert("Tạo khóa học thất bại");
    }
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

        {/* Main content */}
        <main className="flex-1 p-8 space-y-8">
          {/* Đây là tiêu đề và nút mở form */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Create New Course</h1>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              {showForm ? "Close Form" : "Open Form"}
            </button>
          </div>

          {/* Form nhập thông tin */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded shadow space-y-4"
            >
              <div>
                <label className="block font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-medium">Image</label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading…" : "Select Image…"}
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
                  name="image"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium">Level</label>
                  <input
                    type="text"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Duration (phút)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium">Passing Score</label>
                  <input
                    type="number"
                    name="passingScore"
                    value={formData.passingScore}
                    onChange={handleChange}
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

          {/* Hiển thị danh sách My Courses */}
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
                      {/* Hiển thị đúng title */}
                      <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Level: {c.level} • Duration: {c.duration} phút
                      </p>
                      <p className="text-gray-500 text-sm mb-4">
                        Status: {c.status}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded">
                        Add
                      </button>
                      <button className="flex-1 px-3 py-2 border rounded">
                        Edit
                      </button>
                      <button className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded">
                        Update
                      </button>
                      <Link
                        to={`/consultant/course/${c.id}`}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-center"
                      >
                        View
                      </Link>
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
