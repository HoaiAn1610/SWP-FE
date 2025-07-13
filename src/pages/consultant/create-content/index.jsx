// src/pages/consultant/create-content/index.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/config/axios";
import { uploadFile } from "@/utils/upload";
import CustomPagination from "@/components/courses/Pagination";


export default function CreateContentPage() {
  const navigate = useNavigate();

  // Tab hiện tại: "course" hoặc "question"
  const [activeTab, setActiveTab] = useState("course");

  // --- Alert Popup state ---
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // --- Confirm Popup state ---
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  // --- Course form state ---
  const [showCourseForm, setShowCourseForm] = useState(false);
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

  // --- Courses + filters state ---
  const [courses, setCourses] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterWorkflow, setFilterWorkflow] = useState("");
  const currentUserId = localStorage.getItem("id") || "";

  

  // --- Material form state ---
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

  // --- Question list state ---
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // --- Create Question modal ---
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    level: "",
    category: "",
  });

  // --- Edit Question modal ---
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editQuestionData, setEditQuestionData] = useState({
    questionText: "",
    level: "",
    category: "",
  });
  const [originalQuestion, setOriginalQuestion] = useState(null);

  // --- View Question modal ---
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewQuestion, setViewQuestion] = useState(null);

  // --- Option modals ---
  const [addOptionModalVisible, setAddOptionModalVisible] = useState(false);
  const [newOptions, setNewOptions] = useState([
    { optionText: "", scoreValue: 0 },
  ]);
  const [editOptionModalVisible, setEditOptionModalVisible] = useState(false);
  const [editOption, setEditOption] = useState({
    optionId: null,
    optionText: "",
    scoreValue: 0,
  });

  // --- Category options ---
  const categoryOptions = [
    "Lạm dụng thuốc kê đơn",
    "Ma túy bất hợp pháp & Giải trí",
    "Chất tổng hợp & Hóa chất gia dụng",
    "Rượu & Chất có cồn",
    "Nhận thức & Phòng ngừa",
  ];



  // --- Reload courses ---
  const reloadCourses = async () => {
    try {
      const { data } = await api.get(
        `Course/get-courses-by-createById/${currentUserId}`
      );
      setCourses(data);
    } catch (err) {
      console.error(err);
      setAlertMessage("Không tải được danh sách khóa học.");
      setAlertVisible(true);
    }
  };
  useEffect(() => {
    if (currentUserId) reloadCourses();
  }, [currentUserId]);

  // --- Fetch questions ---
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const { data } = await api.get("Question/get-all-questions");
      setQuestions(data);
    } catch (err) {
      console.error(err);
      setAlertMessage("Không tải được danh sách câu hỏi.");
      setAlertVisible(true);
    } finally {
      setLoadingQuestions(false);
    }
  };
  useEffect(() => {
    if (activeTab === "question") fetchQuestions();
  }, [activeTab]);

  // --- Course form handlers ---
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
    } catch {
      setAlertMessage("Upload ảnh thất bại.");
      setAlertVisible(true);
    } finally {
      setUploadingCourseImage(false);
    }
  };
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("Course/create-course", formData);
      setAlertMessage("Tạo khóa học thành công!");
      setAlertVisible(true);
      reloadCourses();
      setShowCourseForm(false);
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
    } catch {
      setAlertMessage("Tạo khóa học thất bại.");
      setAlertVisible(true);
    }
  };

  // --- Material form handlers ---
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
    } catch {
      setAlertMessage("Upload file thất bại.");
      setAlertVisible(true);
    } finally {
      setUploadingMaterialFile(false);
    }
  };
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `courses/${selectedCourseId}/CourseMaterial/add-material`,
        materialData
      );
      setAlertMessage("Thêm tài liệu thành công!");
      setAlertVisible(true);
      setMaterialFormVisible(false);
    } catch {
      setAlertMessage("Thêm tài liệu thất bại.");
      setAlertVisible(true);
    }
  };

  // --- Submit to Manager ---
  const confirmSubmitToManager = (courseId) => {
    setConfirmMessage("Bạn có chắc muốn gửi khóa học này lên Manager không?");
    setConfirmAction(() => async () => {
      try {
        await api.post(`/Course/${courseId}/submit-to-manager`);
        setAlertMessage("Đã gửi lên Manager thành công!");
        setAlertVisible(true);
        reloadCourses();
      } catch {
        setAlertMessage(
          "Gửi lên Manager thất bại. Khóa học có thể không ở trạng thái Draft."
        );
        setAlertVisible(true);
      }
    });
    setConfirmVisible(true);
  };

  // --- Create Question handlers ---
  const openCreateModal = () => {
    setNewQuestion({ questionText: "", level: "", category: "" });
    setCreateModalVisible(true);
  };
  const addQuestion = () => {
    const { questionText, level, category } = newQuestion;
    if (!questionText || !level || !category) {
      setAlertMessage("Điền đầy đủ thông tin câu hỏi.");
      setAlertVisible(true);
      return;
    }
    api
      .post("Question/create-questions", [newQuestion])
      .then(() => {
        setAlertMessage("Tạo câu hỏi thành công!");
        setAlertVisible(true);
        setCreateModalVisible(false);
        fetchQuestions();
      })
      .catch(() => {
        setAlertMessage("Tạo câu hỏi thất bại.");
        setAlertVisible(true);
      });
  };

  // --- Edit Question handlers ---
  const openEditModal = (q) => {
    setEditQuestionId(q.id);
    setOriginalQuestion(q);
    setEditQuestionData({
      questionText: q.questionText,
      level: q.level,
      category: q.category,
    });
    setEditModalVisible(true);
  };
  const updateQuestion = () => {
    const { questionText, level, category } = editQuestionData;
    if (
      questionText === originalQuestion.questionText &&
      level === originalQuestion.level &&
      category === originalQuestion.category
    ) {
      setAlertMessage("Bạn chưa thay đổi gì cả.");
      setAlertVisible(true);
      return;
    }
    const dto = { questionText, level, category };
    api
      .put(`Question/update-question/${editQuestionId}`, dto)
      .then(() => {
        setAlertMessage("Cập nhật câu hỏi thành công!");
        setAlertVisible(true);
        setEditModalVisible(false);
        fetchQuestions();
      })
      .catch(() => {
        setAlertMessage("Cập nhật câu hỏi thất bại.");
        setAlertVisible(true);
      });
  };

  // --- Delete Question ---
  const handleDeleteQuestion = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    api
      .delete(`Question/delete-question/${id}`)
      .then(() => {
        setAlertMessage("Xóa câu hỏi thành công!");
        setAlertVisible(true);
        fetchQuestions();
      })
      .catch(() => {
        setAlertMessage("Xóa câu hỏi thất bại.");
        setAlertVisible(true);
      });
  };

  // --- View Question handlers (luôn fetch fresh trước khi mở) ---
  const openViewModal = async (q) => {
    try {
      // Load lại tất cả câu hỏi để có option mới nhất
      const { data } = await api.get("Question/get-all-questions");
      setQuestions(data);
      const fresh = data.find((item) => item.id === q.id);
      setViewQuestion(fresh);
      setViewModalVisible(true);
    } catch {
      setAlertMessage("Không tải được chi tiết câu hỏi.");
      setAlertVisible(true);
    }
  };

  // --- Thêm nhiều options và làm mới viewQuestion ---
  const handleAddOptions = async () => {
    const payload = newOptions.filter((opt) => opt.optionText.trim() !== "");
    if (payload.length === 0) {
      setAlertMessage("Vui lòng nhập ít nhất một đáp án.");
      setAlertVisible(true);
      return;
    }
    try {
      await api.post(`Question/${viewQuestion.id}/add-options`, payload);
      setAlertMessage("Thêm đáp án thành công!");
      setAlertVisible(true);
      setAddOptionModalVisible(false);
      // Refresh toàn bộ questions và viewQuestion
      const { data: allQ } = await api.get("Question/get-all-questions");
      setQuestions(allQ);
      const fresh = allQ.find((item) => item.id === viewQuestion.id);
      setViewQuestion(fresh);
      setNewOptions([{ optionText: "", scoreValue: 0 }]);
    } catch {
      setAlertMessage("Thêm đáp án thất bại.");
      setAlertVisible(true);
    }
  };

  // --- Xóa một dòng option tạm trước khi lưu ---
  const removeOption = (index) => {
    setNewOptions((opts) => opts.filter((_, i) => i !== index));
  };

  // --- Edit Option handlers ---
  const openEditOptionModal = (opt) => {
    setEditOption({
      optionId: opt.id,
      optionText: opt.optionText,
      scoreValue: opt.scoreValue,
    });
    setEditOptionModalVisible(true);
  };
  const handleUpdateOption = () => {
    const { optionId, optionText, scoreValue } = editOption;
    api
      .put(`/api/Question/${viewQuestion.id}/update-options/${optionId}`, {
        optionText,
        scoreValue,
      })
      .then(() => {
        setAlertMessage("Cập nhật đáp án thành công!");
        setAlertVisible(true);
        setEditOptionModalVisible(false);
        // Cập nhật ngay trong viewQuestion
        setViewQuestion((vq) => ({
          ...vq,
          options: vq.options.map((o) =>
            o.id === optionId ? { ...o, optionText, scoreValue } : o
          ),
        }));
      })
      .catch(() => {
        setAlertMessage("Cập nhật đáp án thất bại.");
        setAlertVisible(true);
      });
  };

  // --- Course filters & rendering ---
  const statusOptions = Array.from(
    new Set(courses.map((c) => c.status).filter(Boolean))
  );
  const workflowOptions = Array.from(
    new Set(courses.map((c) => c.workflowState).filter(Boolean))
  );
  const filteredCourses = courses
    .filter((c) => (filterStatus ? c.status === filterStatus : true))
    .filter((c) =>
      filterWorkflow ? c.workflowState === filterWorkflow : true
    );

      const [coursePage, setCoursePage] = useState(1);
  const coursePageSize = 5; // số mục trên mỗi trang

  const [questionPage, setQuestionPage] = useState(1);
  const questionPageSize = 10;

  const totalCoursePages = Math.ceil(filteredCourses.length / coursePageSize);
const pagedCourses = filteredCourses.slice(
  (coursePage - 1) * coursePageSize,
  coursePage * coursePageSize
);

const totalQuestionPages = Math.ceil(questions.length / questionPageSize);
const pagedQuestions = questions.slice(
  (questionPage - 1) * questionPageSize,
  questionPage * questionPageSize
);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Header + Tabs */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTab === "course" ? "Quản lý Khóa học" : "Quản lý Câu hỏi"}
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("course")}
              className={`px-4 py-2 rounded ${
                activeTab === "course"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Khóa học
            </button>
            <button
              onClick={() => setActiveTab("question")}
              className={`px-4 py-2 rounded ${
                activeTab === "question"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Câu hỏi
            </button>
          </div>
        </div>

        {activeTab === "course" ? (
          <>
            {/* Nút Tạo Khóa học */}
            <div className="text-right">
              <button
                onClick={() => setShowCourseForm((v) => !v)}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:scale-105 transition"
              >
                {showCourseForm ? "Đóng Form" : "Tạo Khóa học"}
              </button>
            </div>

            {/* Course Form */}
            {showCourseForm && (
              <form
                onSubmit={handleCourseSubmit}
                className="bg-white rounded-lg shadow p-6 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tiêu đề
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleCourseChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ảnh
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => courseImageRef.current.click()}
                        disabled={uploadingCourseImage}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        {uploadingCourseImage ? "Đang tải…" : "Chọn Ảnh…"}
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      value={formData.description}
                      onChange={handleCourseChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nội dung
                    </label>
                    <textarea
                      name="content"
                      rows={4}
                      value={formData.content}
                      onChange={handleCourseChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nhóm chủ đề
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleCourseChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="" disabled>
                        -- Chọn nhóm --
                      </option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mức độ
                    </label>
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
                      <option value="Low">Thấp</option>
                      <option value="Medium">Trung bình</option>
                      <option value="High">Cao</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Thời lượng (phút)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleCourseChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Điểm đậu
                    </label>
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
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Gửi
                  </button>
                </div>
              </form>
            )}

            {/* Danh sách Khóa học */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Khóa học của tôi</h2>
              <div className="flex space-x-4 mb-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="">— Tất cả trạng thái —</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  value={filterWorkflow}
                  onChange={(e) => setFilterWorkflow(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="">— Tất cả quy trình —</option>
                  {workflowOptions.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              {filteredCourses.length === 0 ? (
                <p className="text-gray-500">Chưa có khóa học nào.</p>
              ) : (
                <div className="border rounded p-4 space-y-4">
                  {pagedCourses.map((c) => (
                    <div
                      key={c.id}
                      className="flex justify-between items-center p-2 bg-white rounded shadow"
                    >
                      <div>
                        <h3 className="font-semibold">{c.title}</h3>
                        <p className="text-sm text-gray-600">
                          Mức độ: {c.level} • Thời lượng: {c.duration} phút
                        </p>
                        <p className="text-sm text-gray-500">
                          Trạng thái: {c.status} • Quy trình: {c.workflowState}
                        </p>
                        {c.reviewComments && (
                          <p className="text-sm text-red-600 mt-1">
                            Lý do từ chối: {c.reviewComments}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openMaterialForm(c.id)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          Thêm tài liệu
                        </button>
                        <button
                          onClick={() => navigate(`/consultant/course/${c.id}`)}
                          className="px-3 py-1 bg-blue-500 text-white rounded"
                        >
                          Xem
                        </button>
                        {c.workflowState === "Draft" && (
                          <button
                            onClick={() => confirmSubmitToManager(c.id)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded"
                          >
                            Gửi lên Manager
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {totalCoursePages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <CustomPagination
                      currentPage={coursePage}
                      totalPages={totalCoursePages}
                      onPageChange={setCoursePage}
                    />
                  </div>
                )}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* Tab Câu hỏi */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Danh sách Câu hỏi</h2>
              <button
                onClick={openCreateModal}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:scale-105 transition"
              >
                Thêm Câu hỏi
              </button>
            </div>
            {loadingQuestions ? (
              <p>Đang tải...</p>
            ) : (
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2 text-left">Nội dung</th>
                    <th className="px-4 py-2">Mức độ</th>
                    <th className="px-4 py-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedQuestions.map((q, idx) => (
                    <tr
                      key={q.id}
                      className={idx % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{q.questionText}</td>
                      <td className="px-4 py-2">{q.level}</td>
                      <td className="px-4 py-2 flex items-center space-x-2">
                        <button
                          onClick={() => openViewModal(q)}
                          className="px-3 py-1 bg-blue-500 text-white rounded"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => openEditModal(q)}
                          className="px-3 py-1 bg-yellow-400 text-gray-800 rounded"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
            )}
            {totalQuestionPages > 1 && (
      <div className="mt-4 flex justify-center">
        <CustomPagination
          currentPage={questionPage}
          totalPages={totalQuestionPages}
          onPageChange={setQuestionPage}
        />
      </div>
    )}
          </>
        )}

        {/* Modal Tạo Câu hỏi */}
        {createModalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Tạo câu hỏi mới
                </h2>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Nội dung câu hỏi"
                    value={newQuestion.questionText}
                    onChange={(e) =>
                      setNewQuestion((q) => ({
                        ...q,
                        questionText: e.target.value,
                      }))
                    }
                    className="flex-1 border-gray-300 rounded px-3 py-2"
                  />
                  <select
                    value={newQuestion.level}
                    onChange={(e) =>
                      setNewQuestion((q) => ({
                        ...q,
                        level: e.target.value,
                      }))
                    }
                    className="w-40 border-gray-300 rounded px-3 py-2"
                  >
                    <option value="" disabled>
                      -- Mức độ --
                    </option>
                    <option value="Low">Thấp</option>
                    <option value="Medium">Trung bình</option>
                    <option value="High">Cao</option>
                  </select>
                  <select
                    value={newQuestion.category}
                    onChange={(e) =>
                      setNewQuestion((q) => ({
                        ...q,
                        category: e.target.value,
                      }))
                    }
                    className="w-48 border-gray-300 rounded px-3 py-2"
                  >
                    <option value="" disabled>
                      -- Nhóm chủ đề --
                    </option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addQuestion}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    + Thêm
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 border-t text-right">
                <button
                  onClick={() => setCreateModalVisible(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Sửa Câu hỏi */}
        {editModalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Sửa câu hỏi
                </h2>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Nội dung câu hỏi"
                    value={editQuestionData.questionText}
                    onChange={(e) =>
                      setEditQuestionData((q) => ({
                        ...q,
                        questionText: e.target.value,
                      }))
                    }
                    className="flex-1 border-gray-300 rounded px-3 py-2"
                  />
                  <select
                    value={editQuestionData.level}
                    onChange={(e) =>
                      setEditQuestionData((q) => ({
                        ...q,
                        level: e.target.value,
                      }))
                    }
                    className="w-40 border-gray-300 rounded px-3 py-2"
                  >
                    <option value="" disabled>
                      -- Mức độ --
                    </option>
                    <option value="Low">Thấp</option>
                    <option value="Medium">Trung bình</option>
                    <option value="High">Cao</option>
                  </select>
                  <select
                    value={editQuestionData.category}
                    onChange={(e) =>
                      setEditQuestionData((q) => ({
                        ...q,
                        category: e.target.value,
                      }))
                    }
                    className="w-48 border-gray-300 rounded px-3 py-2"
                  >
                    <option value="" disabled>
                      -- Nhóm chủ đề --
                    </option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={updateQuestion}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Lưu
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 border-t text-right">
                <button
                  onClick={() => setEditModalVisible(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Chi tiết + Thêm/Sửa đáp án */}
        {viewModalVisible && viewQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Chi tiết câu hỏi
                </h2>
                <button
                  onClick={() => setAddOptionModalVisible(true)}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Thêm đáp án
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p>
                  <span className="font-semibold">Nội dung:</span>{" "}
                  {viewQuestion.questionText}
                </p>
                <p>
                  <span className="font-semibold">Mức độ:</span>{" "}
                  {viewQuestion.level}
                </p>
                <div>
                  <span className="font-semibold">Các lựa chọn:</span>
                  <ul className="list-disc list-inside mt-2 space-y-2">
                    {viewQuestion.options.map((opt) => (
                      <li key={opt.id} className="flex justify-between">
                        <span>
                          {opt.optionText}{" "}
                          {opt.scoreValue > 0 && (
                            <span className="text-green-600">(Đúng)</span>
                          )}
                        </span>
                        <button
                          onClick={() => openEditOptionModal(opt)}
                          className="px-2 py-1 bg-yellow-400 text-gray-800 rounded"
                        >
                          Sửa đáp án
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="px-6 py-4 border-t text-right">
                <button
                  onClick={() => setViewModalVisible(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Thêm đáp án */}
        {addOptionModalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Thêm đáp án
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setNewOptions([
                      ...newOptions,
                      { optionText: "", scoreValue: 0 },
                    ])
                  }
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Thêm đáp án nữa
                </button>
              </div>
              {/* Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {newOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Nội dung đáp án"
                      value={opt.optionText}
                      onChange={(e) => {
                        const list = [...newOptions];
                        list[idx].optionText = e.target.value;
                        setNewOptions(list);
                      }}
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Score"
                      value={opt.scoreValue}
                      onChange={(e) => {
                        const list = [...newOptions];
                        list[idx].scoreValue = Number(e.target.value);
                        setNewOptions(list);
                      }}
                      className="w-16 border rounded px-2 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div className="px-6 py-4 border-t flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setAddOptionModalVisible(false);
                    setNewOptions([{ optionText: "", scoreValue: 0 }]);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddOptions}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Lưu đáp án
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Sửa đáp án */}
        {editOptionModalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Sửa đáp án
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Nội dung đáp án"
                  value={editOption.optionText}
                  onChange={(e) =>
                    setEditOption((o) => ({ ...o, optionText: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Score value"
                  value={editOption.scoreValue}
                  onChange={(e) =>
                    setEditOption((o) => ({
                      ...o,
                      scoreValue: Number(e.target.value),
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="px-6 py-4 border-t flex justify-end space-x-2">
                <button
                  onClick={() => setEditOptionModalVisible(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateOption}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Cập nhật đáp án
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Material Form Modal */}
        {materialFormVisible && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleMaterialSubmit}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Thêm tài liệu cho khóa #{selectedCourseId}
                </h2>
                <button
                  type="button"
                  onClick={() => setMaterialFormVisible(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loại</label>
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
                  <option value="Document">Tài liệu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiêu đề
                </label>
                <input
                  name="title"
                  value={materialData.title}
                  onChange={handleMaterialChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  File (URL)
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => materialFileRef.current.click()}
                    disabled={uploadingMaterialFile}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    {uploadingMaterialFile ? "Đang tải…" : "Chọn file…"}
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
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  name="description"
                  rows={2}
                  value={materialData.description}
                  onChange={handleMaterialChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thứ tự</label>
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
                  Thêm tài liệu
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirm Popup */}
        {confirmVisible && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="mb-4 font-semibold text-indigo-800">
                {confirmMessage}
              </p>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setConfirmVisible(false)}
                  className="px-4 py-2 border rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setConfirmVisible(false);
                    confirmAction();
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Popup */}
        {alertVisible && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="mb-4 font-semibold text-indigo-800">
                {alertMessage}
              </p>
              <button
                onClick={() => setAlertVisible(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
