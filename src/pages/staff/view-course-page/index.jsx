// src/pages/consultant/view-course-page/index.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/axios";
import { uploadFile } from "@/utils/upload";

export default function ViewConsultantCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const currentID = courseId;

  // trạng thái chung
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);

  // edit khóa học
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    image: "",
    description: "",
    content: "",
    category: "",
    level: "",
    duration: 0,
    passingScore: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageRef = useRef(null);

  // edit vật liệu
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [materialEditData, setMaterialEditData] = useState({
    type: "",
    title: "",
    url: "",
    description: "",
    sortOrder: 0,
  });
  const [uploadingMaterialFile, setUploadingMaterialFile] = useState(false);
  const materialFileRef = useRef(null);

  useEffect(() => {
    (async () => {
      // 1. Fetch thông tin course
      try {
        const { data: c } = await api.get(`Course/get-course/${courseId}`);
        setCourse(c);
      } catch (err) {
        console.error("Không tải được course:", err);
        alert("Không tải được dữ liệu khóa học.");
        navigate(-1);
        return;
      }
      // 2. Fetch materials (nếu lỗi thì bỏ qua)
      try {
        const { data: m } = await api.get(
          `courses/${courseId}/CourseMaterial/get-materials-of-course`
        );
        setMaterials(m);
      } catch (err) {
        console.warn("Không lấy được materials, bỏ qua:", err);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, navigate]);

  // --- Handlers edit course ---
  const startEditing = () => {
    setEditData({
      id: currentID,
      title: course.title,
      image: course.image,
      description: course.description,
      content: course.content,
      category: course.category,
      level: course.level,
      duration: course.duration,
      passingScore: course.passingScore,
      workflowState: course.workflowState,
    });
    setIsEditing(true);
  };
  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    setEditData((d) => ({
      ...d,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadFile(file, "courses");
      setEditData((d) => ({ ...d, image: url }));
    } finally {
      setUploadingImage(false);
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`Course/update-course/${courseId}`, editData);
      setCourse((c) => ({ ...c, ...editData, status: "Pending" }));
      setIsEditing(false);
      alert("Cập nhật khóa học thành công!");
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại.");
    }
  };

  // --- Handlers edit material ---
  const startMaterialEdit = (mat) => {
    setEditingMaterialId(mat.id);
    setMaterialEditData({
      id: mat.id,
      courseId: currentID,
      type: mat.type,
      title: mat.title,
      url: mat.url,
      description: mat.description,
      sortOrder: mat.sortOrder,
    });
  };
  const handleMaterialChange = (e) => {
    const { name, value, type } = e.target;
    setMaterialEditData((m) => ({
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
      setMaterialEditData((m) => ({ ...m, url }));
    } finally {
      setUploadingMaterialFile(false);
    }
  };
  const handleMaterialEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        `courses/${courseId}/CourseMaterial/update-material/${editingMaterialId}`,
        materialEditData
      );
      setMaterials((ms) =>
        ms.map((m) =>
          m.id === editingMaterialId ? { ...m, ...materialEditData } : m
        )
      );
      setEditingMaterialId(null);
      alert("Cập nhật material thành công!");
    } catch (err) {
      console.error(err);
      alert("Cập nhật material thất bại.");
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-8 space-y-8">
        {/* Header + nút Edit/Back */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            {isEditing ? "Edit Course" : `View Course: ${course.title}`}
          </h1>
          <div className="space-x-2">
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={startEditing}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Back
            </button>
          </div>
        </div>

        {/* FORM EDIT COURSE */}
        {isEditing && (
          <form
            onSubmit={handleEditSubmit}
            className="bg-white p-6 rounded shadow space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Title</label>
                <input
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium">Image</label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => imageRef.current.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    {uploadingImage ? "Uploading…" : "Select Image…"}
                  </button>
                  {editData.image && (
                    <a
                      href={editData.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 underline break-all"
                    >
                      {editData.image}
                    </a>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={imageRef}
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium">Description</label>
              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
                rows={2}
              />
            </div>
            <div>
              <label className="block font-medium">Content</label>
              <textarea
                name="content"
                value={editData.content}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Category</label>
                <input
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium">Level</label>
                <select
                  name="level"
                  value={editData.level}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- Chọn mức độ --</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Duration (phút)</label>
                <input
                  name="duration"
                  type="number"
                  value={editData.duration}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium">Passing Score</label>
                <input
                  name="passingScore"
                  type="number"
                  value={editData.passingScore}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* VIEW COURSE INFO */}
        {!isEditing && (
          <section className="bg-white p-6 rounded shadow space-y-2">
            <div>
              <strong>Title:</strong> {course.title}
            </div>
            <div>
              <strong>Image URL:</strong>{" "}
              <a
                href={course.image}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {course.image}
              </a>
            </div>
            <div>
              <strong>Description:</strong> {course.description}
            </div>
            <div>
              <strong>Content:</strong> {course.content}
            </div>
            <div>
              <strong>Category:</strong> {course.category}
            </div>
            <div>
              <strong>Level:</strong> {course.level}
            </div>
            <div>
              <strong>Duration:</strong> {course.duration} phút
            </div>
            <div>
              <strong>Passing Score:</strong> {course.passingScore}
            </div>
            <div>
              <strong>Status:</strong> {course.status}
            </div>
          </section>
        )}

        {/* MATERIALS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Materials</h2>
          {materials.length === 0 ? (
            <p className="text-gray-500">Chưa có material nào.</p>
          ) : (
            materials.map((m) =>
              editingMaterialId === m.id ? (
                <form
                  key={m.id}
                  onSubmit={handleMaterialEditSubmit}
                  className="bg-white p-4 rounded shadow space-y-3"
                >
                  {/* Type */}
                  <div>
                    <label className="block font-medium">Type</label>
                    <select
                      name="type"
                      value={materialEditData.type}
                      onChange={handleMaterialChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">-- Chọn loại --</option>
                      <option value="Video">Video</option>
                      <option value="Document">Document</option>
                    </select>
                  </div>
                  {/* Title */}
                  <div>
                    <label className="block font-medium">Title</label>
                    <input
                      name="title"
                      value={materialEditData.title}
                      onChange={handleMaterialChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  {/* URL */}
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
                      <span className="text-sm text-gray-600 break-all">
                        {materialEditData.url}
                      </span>
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
                      value={materialEditData.description}
                      onChange={handleMaterialChange}
                      className="w-full border rounded px-3 py-2"
                      rows={2}
                    />
                  </div>
                  {/* Sort Order */}
                  <div>
                    <label className="block font-medium">Sort Order</label>
                    <input
                      name="sortOrder"
                      type="number"
                      value={materialEditData.sortOrder}
                      onChange={handleMaterialChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  {/* Buttons */}
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingMaterialId(null)}
                      className="px-4 py-2 bg-gray-300 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  key={m.id}
                  className="bg-white p-4 rounded shadow flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <div>
                      <strong>Type:</strong> {m.type}
                    </div>
                    <div>
                      <strong>Title:</strong> {m.title}
                    </div>
                    <div>
                      <strong>URL:</strong>{" "}
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {m.url}
                      </a>
                    </div>
                    <div>
                      <strong>Description:</strong> {m.description}
                    </div>
                    <div>
                      <strong>Sort Order:</strong> {m.sortOrder}
                    </div>
                  </div>
                  <button
                    onClick={() => startMaterialEdit(m)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                </div>
              )
            )
          )}
        </section>
      </main>
    </div>
  );
}
