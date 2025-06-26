// src/pages/consultant/view-course-page/index.jsx

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mammoth from "mammoth";
import api from "@/config/axios";
import { uploadFile } from "@/utils/upload";

export default function ViewConsultantCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // loading & data
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [docHtml, setDocHtml] = useState({}); // for .docx → HTML

  // alert popup
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // --- edit course ---
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

  // --- edit material ---
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

  // fetch course + materials
  useEffect(() => {
    (async () => {
      try {
        const { data: c } = await api.get(`Course/get-course/${courseId}`);
        setCourse(c);
      } catch {
        alert("Không tải được dữ liệu khóa học.");
        return navigate(-1);
      }
      try {
        const { data: m } = await api.get(
          `courses/${courseId}/CourseMaterial/get-materials-of-course`
        );
        setMaterials(m);
      } catch {
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, navigate]);

  // convert any .docx → HTML
  useEffect(() => {
    materials
      .filter((m) => m.type === "Document")
      .forEach(async (m) => {
        try {
          const resp = await fetch(m.url);
          const arrayBuffer = await resp.arrayBuffer();
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
          setDocHtml((prev) => ({ ...prev, [m.id]: html }));
        } catch {
          console.error(`Lỗi convert material ${m.id}`);
        }
      });
  }, [materials]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }

  // ——— Course Handlers ———
  const startEditing = () => {
    setEditData({
      id: course.id,
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
      console.log(editData);
      await api.put(`Course/update-course/${courseId}`, editData);
      setCourse((c) => ({ ...c, ...editData }));
      setIsEditing(false);
      setAlertMessage("Cập nhật khóa học thành công!");
      setAlertVisible(true);
    } catch {
      setAlertMessage("Cập nhật thất bại.");
      setAlertVisible(true);
    }
  };

  // ——— Material Handlers ———
  const startMaterialEdit = (mat) => {
    setEditingMaterialId(mat.id);
    setMaterialEditData({
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
      setAlertMessage("Cập nhật material thành công!");
      setAlertVisible(true);
    } catch {
      setAlertMessage("Cập nhật material thất bại.");
      setAlertVisible(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Edit Course" : course.title}
          </h1>
          <div className="space-x-2">
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={startEditing}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Back
            </button>
          </div>
        </div>

        {/* Edit Course Form */}
        {isEditing && (
          <form
            onSubmit={handleEditSubmit}
            className="bg-white p-6 rounded-lg shadow space-y-6"
          >
            {/* Title + Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-1">Title</label>
                <input
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Image</label>
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
                      className="underline text-indigo-600"
                    >
                      View Image
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

            {/* Description & Content */}
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={editData.description}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Content</label>
                <textarea
                  name="content"
                  rows={4}
                  value={editData.content}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Category, Level, Duration, PassingScore */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block font-medium mb-1">Category</label>
                <input
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Level</label>
                <select
                  name="level"
                  value={editData.level}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Duration (min)</label>
                <input
                  name="duration"
                  type="number"
                  value={editData.duration}
                  onChange={handleEditChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Passing Score</label>
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

        {/* View Course Details */}
        {!isEditing && (
          <section className="bg-white p-6 rounded-lg shadow space-y-3">
            <div>
              <strong>Title:</strong> {course.title}
            </div>
            <div>
              <strong>Image:</strong>
              <img
                src={course.image}
                alt={course.title}
                className="mt-2 max-w-full rounded border"
              />
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

        {/* Materials */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Materials</h2>
          {materials.length === 0 ? (
            <p className="text-gray-500">No materials yet.</p>
          ) : (
            materials.map((m) =>
              editingMaterialId === m.id ? (
                <form
                  key={m.id}
                  onSubmit={handleMaterialEditSubmit}
                  className="bg-white p-6 rounded-lg shadow space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">Type</label>
                      <select
                        name="type"
                        value={materialEditData.type}
                        onChange={handleMaterialChange}
                        className="w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="">-- Select --</option>
                        <option value="Video">Video</option>
                        <option value="Document">Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Title</label>
                      <input
                        name="title"
                        value={materialEditData.title}
                        onChange={handleMaterialChange}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">File URL</label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => materialFileRef.current.click()}
                        disabled={uploadingMaterialFile}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        {uploadingMaterialFile ? "Uploading…" : "Select File…"}
                      </button>
                      {materialEditData.url && (
                        <a
                          href={materialEditData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-indigo-600 break-all"
                        >
                          View File
                        </a>
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

                  <div>
                    <label className="block font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      value={materialEditData.description}
                      onChange={handleMaterialChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Sort Order</label>
                    <input
                      name="sortOrder"
                      type="number"
                      value={materialEditData.sortOrder}
                      onChange={handleMaterialChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div className="flex space-x-2 justify-end">
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
                  className="bg-white p-6 rounded-lg shadow space-y-3"
                >
                  <div>
                    <strong>{m.title}</strong> ({m.type})
                  </div>

                  {/* render by type */}
                  {m.type === "Video" ? (
                    <video
                      controls
                      src={m.url}
                      className="w-full max-h-64 rounded mb-4 border"
                    />
                  ) : /\.(jpe?g|png|gif|bmp|webp)$/i.test(m.url) ? (
                    <img
                      src={m.url}
                      alt={m.title}
                      className="w-full max-h-64 object-contain rounded mb-4 border"
                    />
                  ) : m.type === "Document" ? (
                    <div
                      className="prose max-w-none mb-4 overflow-x-auto"
                      dangerouslySetInnerHTML={{
                        __html: docHtml[m.id] || "<p>Loading document…</p>",
                      }}
                    />
                  ) : (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 mb-4 block"
                    >
                      Download File
                    </a>
                  )}

                  <div>
                    <strong>Description:</strong> {m.description}
                  </div>
                  <div>
                    <strong>Sort Order:</strong> {m.sortOrder}
                  </div>

                  <div className="text-right">
                    <button
                      onClick={() => startMaterialEdit(m)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </section>
      </main>

      {/* Alert Popup */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs text-center">
            <p className="mb-4 font-semibold text-indigo-800">{alertMessage}</p>
            <button
              onClick={() => setAlertVisible(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
