// src/pages/staff/StaffInquiriesPage.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "@/config/axios";
import { uploadFile } from "@/utils/upload";

export default function StaffInquiriesPage() {
  const currentStaffId = Number(localStorage.getItem("id"));
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat state
  const [expandedId, setExpandedId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [newAttachmentType, setNewAttachmentType] = useState("");

  // Assignment state
  const [assignModalInquiryId, setAssignModalInquiryId] = useState(null);
  const [consultants, setConsultants] = useState([]);
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Alert & Confirm
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  // assignments map
  const [assignments, setAssignments] = useState({});

  const chatEndRef = useRef(null);

  // 1. Load inquiries
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/UserInquiry/get-inquiry-by-staff");
        setInquiries(data);
      } catch {
        setError("Không tải được danh sách yêu cầu.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. Load assignments cho mỗi inquiry
  useEffect(() => {
    inquiries.forEach((iq) => {
      api
        .get(`/InquiryAssignment/get-inquiry-assignment/${iq.id}`)
        .then(({ data }) => {
          setAssignments((prev) => ({
            ...prev,
            [iq.id]: data.length > 0 ? data[0] : null,
          }));
        })
        .catch(console.error);
    });
  }, [inquiries]);

  // 3. Fetch comments khi toggle
  const fetchComments = async (inquiryID) => {
    try {
      const { data } = await api.get(
        `/InquiryComment/get-inquiry-comment/inquiry/${inquiryID}`
      );
      setComments(data);
    } catch {
      console.error("Lỗi khi tải comments");
    }
  };

  const toggleChat = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setComments([]);
    } else {
      setExpandedId(id);
      setNewComment("");
      setNewAttachmentUrl("");
      setNewAttachmentName("");
      setNewAttachmentType("");
      fetchComments(id);
    }
  };

  // 4. Modal gán consultant
  const openAssignModal = (id) => {
    setAssignModalInquiryId(id);
    if (consultants.length === 0) fetchConsultants();
  };

  const fetchConsultants = async () => {
    setLoadingConsultants(true);
    try {
      const { data } = await api.get("/ConsultantSchedule/get-all-consultant");
      setConsultants(data);
    } catch {
      setAlertMessage("Không tải được danh sách consultant.");
      setAlertVisible(true);
    } finally {
      setLoadingConsultants(false);
    }
  };

  const handleAssign = async (consultantId) => {
    setAssigning(true);
    try {
      await api.post("/InquiryAssignment/create-inquiry-assignment", {
        inquiryId: assignModalInquiryId,
        assignedById: currentStaffId,
        assignedToId: consultantId,
        assignedDate: new Date().toISOString(),
        priority: "Normal",
        isActive: true,
      });
      setAlertMessage("Gán consultant thành công!");
      setAlertVisible(true);
      setAssignModalInquiryId(null);
      // reload
      const { data } = await api.get(
        `/InquiryAssignment/get-inquiry-assignment/${assignModalInquiryId}`
      );
      setAssignments((prev) => ({
        ...prev,
        [assignModalInquiryId]: data.length > 0 ? data[0] : null,
      }));
    } catch {
      setAlertMessage("Gán consultant thất bại.");
      setAlertVisible(true);
    } finally {
      setAssigning(false);
    }
  };

  // 5. Upload file trước khi gửi comment
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "inquiries");
      setNewAttachmentUrl(url);
      setNewAttachmentName(file.name);
      setNewAttachmentType(
        file.type.startsWith("image/")
          ? "Image"
          : file.type.startsWith("video/")
          ? "Video"
          : "File"
      );
    } catch {
      setAlertMessage("Upload file thất bại.");
      setAlertVisible(true);
    }
  };

  const handleSend = async () => {
    if (!newComment.trim() && !newAttachmentUrl) return;
    try {
      await api.post("/InquiryComment/create-inquiry-comment", {
        inquiryID: expandedId,
        commentByID: currentStaffId,
        commentType: "Response",
        commentText: newComment.trim(),
        attachmentURL: newAttachmentUrl,
        fileName: newAttachmentName,
        attachmentType: newAttachmentType,
      });
      setNewComment("");
      setNewAttachmentUrl("");
      setNewAttachmentName("");
      setNewAttachmentType("");
      fetchComments(expandedId);
    } catch {
      setAlertMessage("Gửi thất bại.");
      setAlertVisible(true);
    }
  };

  // Xóa inquiry
  const handleDeleteInquiry = async (id) => {
    setConfirmVisible(false);
    try {
      await api.delete(`/UserInquiry/delete-inquiry/${id}`);
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
        setComments([]);
      }
      setAlertMessage("Xóa inquiry thành công.");
      setAlertVisible(true);
    } catch {
      setAlertMessage("Xóa inquiry thất bại.");
      setAlertVisible(true);
    }
  };

  const confirmDeleteInquiry = (id) => {
    setConfirmMessage("Bạn có chắc muốn xóa inquiry này?");
    setConfirmAction(() => () => handleDeleteInquiry(id));
    setConfirmVisible(true);
  };

  // ==> 2 hàm format:
  // 1) Inquiry thì giữ nguyên
  const formatInquiryDateTime = (iso) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };
  // 2) Comment thì cộng +7 giờ
  const formatCommentDateTime = (iso) => {
    const d = new Date(iso);
    d.setHours(d.getHours() + 7);
    return (
      d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  // Scroll xuống cuối chat
  useEffect(() => {
    if (expandedId && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, expandedId]);

  if (loading) return <p className="p-6 text-center">Đang tải…</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-semibold">Danh sách Yêu Cầu</h1>
        </div>
        <div className="divide-y">
          {inquiries.map((iq) => {
            const assignment = assignments[iq.id];
            const isAssigned =
              assignment &&
              assignment.assignedById === currentStaffId &&
              assignment.isActive;
            return (
              <div key={iq.id} className="px-6 py-4">
                <div className="flex justify-between items-center space-x-2">
                  <div className="flex-1">
                    <p className="font-semibold">
                      #{iq.id} – {iq.subject}
                    </p>
                    <p className="text-sm text-gray-600">
                      Trạng thái: {iq.status}
                    </p>
                    <p className="text-xs text-gray-500">
                      Tạo: {formatInquiryDateTime(iq.createdDate)}
                    </p>
                    {isAssigned && (
                      <p className="text-sm text-green-600 mt-1">
                        Đã gán cho {assignment.assignedTo.name}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 items-center">
                    <button
                      onClick={() => toggleChat(iq.id)}
                      disabled={isAssigned}
                      className={`px-3 py-1 rounded ${
                        isAssigned
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {expandedId === iq.id ? "Đóng" : "Trả lời"}
                    </button>
                    {!isAssigned && (
                      <button
                        onClick={() => openAssignModal(iq.id)}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Gán
                      </button>
                    )}
                    <button
                      onClick={() => confirmDeleteInquiry(iq.id)}
                      className="px-3 py-1 bg-red-500 text-black hover:bg-red-600 rounded"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Chatbox */}
                {expandedId === iq.id && !isAssigned && (
                  <div className="mt-4 bg-gray-100 rounded-lg p-4 flex flex-col">
                    <div className="overflow-y-auto max-h-64 space-y-3 px-2">
                      {comments.map((c) => {
                        const isStaff = c.commentByID === currentStaffId;
                        return (
                          <div
                            key={c.id}
                            className={`flex ${
                              isStaff ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`px-4 py-2 rounded-lg max-w-xs ${
                                isStaff
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-800 border"
                              }`}
                            >
                              <p className="text-sm">{c.commentText}</p>
                              {c.attachmentURL && (
                                <div className="mt-2">
                                  {c.attachmentType === "Image" && (
                                    <img
                                      src={c.attachmentURL}
                                      alt={c.fileName}
                                      className="max-w-full rounded"
                                    />
                                  )}
                                  {c.attachmentType === "Video" && (
                                    <video
                                      controls
                                      src={c.attachmentURL}
                                      className="max-w-full rounded"
                                    />
                                  )}
                                </div>
                              )}
                              <p className="text-xs text-gray-400 mt-1 text-right">
                                {formatCommentDateTime(c.createdDate)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input gửi */}
                    <div className="mt-4 flex items-center space-x-2">
                      <label className="cursor-pointer">
                        📎
                        <input
                          type="file"
                          accept="image/*,video/*,application/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {newAttachmentUrl && (
                        <a
                          href={newAttachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black underline break-all text-sm flex items-center space-x-1"
                        >
                          🔗 {newAttachmentName}
                        </a>
                      )}
                      <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 border rounded px-3 py-2"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                      />
                      <button
                        onClick={handleSend}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {inquiries.length === 0 && (
            <p className="p-6 text-gray-500">Chưa có yêu cầu nào.</p>
          )}
        </div>
      </div>

      {/* Alert Popup */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
            <h3 className="mb-2 text-lg font-semibold">Thông báo</h3>
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

      {/* Modal Gán consultant */}
      {assignModalInquiryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Chọn Consultant để gán
            </h2>
            {loadingConsultants ? (
              <p>Đang tải...</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {consultants.map((c) => (
                  <li key={c.id} className="flex justify-between items-center">
                    <span>{c.name}</span>
                    <button
                      onClick={() => handleAssign(c.id)}
                      disabled={assigning}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {assigning ? "Đang gán…" : "Gán"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 text-right">
              <button
                onClick={() => setAssignModalInquiryId(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Popup */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
            <h3 className="mb-2 text-lg font-semibold">Xác nhận</h3>
            <p className="mb-4">{confirmMessage}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => confirmAction()}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmVisible(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
