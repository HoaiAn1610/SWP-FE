// src/pages/consultant/ConsultantAssignmentsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "@/config/axios";
import { uploadFile } from "@/utils/upload";

export default function ConsultantAssignmentsPage() {
  const consultantId = Number(localStorage.getItem("id"));

  // Danh sách assignments
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat state cho consultant
  const [expandedId, setExpandedId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newAttachmentFile, setNewAttachmentFile] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Alert popup
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const chatEndRef = useRef(null);

  // 1. Lấy assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await api.get(
          `/InquiryAssignment/get-by-assigned-to/${consultantId}`
        );
        setAssignments(data);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách assignment.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [consultantId]);

  // 2. Toggle chat cho mỗi assignment
  const toggleChat = (inquiryId) => {
    if (expandedId === inquiryId) {
      setExpandedId(null);
      setComments([]);
    } else {
      setExpandedId(inquiryId);
      setNewComment("");
      setNewAttachmentFile(null);
      fetchComments(inquiryId);
    }
  };

  // 3. Fetch comments
  const fetchComments = async (inquiryId) => {
    try {
      const { data } = await api.get(
        `/InquiryComment/get-inquiry-comment/inquiry/${inquiryId}`
      );
      setComments(
        data.map((c) => ({
          id: c.id,
          fromConsultant: c.commentByID === consultantId,
          text: c.commentText,
          attachmentURL: c.attachmentURL,
          fileName: c.fileName,
          attachmentType: c.attachmentType,
          createdDate: c.createdDate,
        }))
      );
    } catch (err) {
      console.error(err);
      setAlertMessage("Không tải được cuộc trò chuyện.");
      setAlertVisible(true);
    }
  };

  // 4. Upload file đính kèm
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAttachment(true);
    try {
      const url = await uploadFile(file, "inquiries");
      setNewAttachmentFile({ url, name: file.name, type: file.type });
    } catch {
      setAlertMessage("Upload file thất bại.");
      setAlertVisible(true);
    } finally {
      setUploadingAttachment(false);
    }
  };

  // 5. Gửi comment
  const handleSend = async () => {
    if (!newComment.trim() && !newAttachmentFile) return;
    try {
      await api.post("/InquiryComment/create-inquiry-comment", {
        inquiryID: expandedId,
        commentByID: consultantId,
        commentType: "Response",
        commentText: newComment.trim(),
        attachmentURL: newAttachmentFile?.url || "",
        fileName: newAttachmentFile?.name || "",
        attachmentType: newAttachmentFile
          ? newAttachmentFile.type.startsWith("image/")
            ? "Image"
            : newAttachmentFile.type.startsWith("video/")
            ? "Video"
            : "File"
          : "",
      });
      fetchComments(expandedId);
      setNewComment("");
      setNewAttachmentFile(null);
    } catch {
      setAlertMessage("Gửi tin nhắn thất bại.");
      setAlertVisible(true);
    }
  };

  // Cuộn xuống cuối khi comments thay đổi
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // Format ngày +7h
  const formatDateTime = (iso) => {
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

  if (loading) return <p className="p-6 text-center">Đang tải…</p>;
  if (error) return <p className="p-6 text-red-600 text-center">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-semibold">Các Yêu Cầu được gán</h1>
        </div>

        {assignments.length === 0 ? (
          <p className="p-6 text-gray-500">Hiện chưa có yêu cầu nào.</p>
        ) : (
          assignments.map((a) => (
            <div key={a.id} className="border-b px-6 py-4 space-y-4">
              {/* Thông tin assignment */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    #{a.id} – Inquiry {a.inquiryId}
                  </p>
                  <p className="text-sm text-gray-600">
                    Gán bởi: {a.assignedBy?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Ngày gán: {formatDateTime(a.assignedDate)}
                  </p>
                </div>
                <button
                  onClick={() => toggleChat(a.inquiryId)}
                  className={`px-3 py-1 rounded ${
                    expandedId === a.inquiryId
                      ? "bg-gray-300 text-gray-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {expandedId === a.inquiryId ? "Đóng Chat" : "Chat"}
                </button>
              </div>

              {/* Chatbox */}
              {expandedId === a.inquiryId && (
                <div className="bg-gray-100 rounded-lg p-4 flex flex-col space-y-4">
                  {/* Messages */}
                  <div className="overflow-y-auto max-h-64 space-y-3 px-2">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className={`flex ${
                          c.fromConsultant ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`px-4 py-2 rounded-lg max-w-xs space-y-1 ${
                            c.fromConsultant
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-800 border"
                          }`}
                        >
                          <p>{c.text}</p>
                          {/* Preview URL ngay khi chọn */}
                          {newAttachmentFile === null && c.attachmentURL
                            ? null
                            : null}
                          {/* Chính xác: chỉ preview trước khi gửi */}
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
                              {c.attachmentType === "File" && (
                                <a
                                  href={c.attachmentURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-black underline break-all flex items-center space-x-1"
                                >
                                  <span>🔗</span>
                                  <span>{c.fileName}</span>
                                </a>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-400 text-right">
                            {formatDateTime(c.createdDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input gửi */}
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer bg-gray-200 p-2 rounded">
                      📎
                      <input
                        type="file"
                        accept="image/*,video/*,application/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {newAttachmentFile && (
                      <a
                        href={newAttachmentFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline break-all flex items-center space-x-1"
                      >
                        <span>🔗</span>
                        <span>{newAttachmentFile.name}</span>
                      </a>
                    )}
                    <input
                      type="text"
                      className="flex-1 border rounded px-3 py-2"
                      placeholder="Nhập tin nhắn…"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
          ))
        )}

        {/* Alert Popup */}
        {alertVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
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
      </div>
    </div>
  );
}
