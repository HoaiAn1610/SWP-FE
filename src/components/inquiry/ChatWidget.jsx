// src/components/ChatWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import api from "@/config/axios";
import { uploadFile } from "@/utils/upload";

export default function ChatWidget() {
  const currentUserId = Number(localStorage.getItem("id"));
  const [open, setOpen] = useState(false);

  // Inquiry flow
  const [myInquiries, setMyInquiries] = useState([]);
  const [inquiryId, setInquiryId] = useState(null);
  const [inquiryText, setInquiryText] = useState("");

  // Chat flow
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [newAttachmentFile, setNewAttachmentFile] = useState(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);

  // Alert Popup
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Confirm Popup
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  const endRef = useRef();

  // Load my inquiries khi mở widget
  useEffect(() => {
    if (open && !inquiryId) {
      api
        .get("/UserInquiry/Member-Inquiries")
        .then(({ data }) => setMyInquiries(data))
        .catch((err) => console.error(err));
    }
  }, [open, inquiryId]);

  // Khi inquiryId thay đổi, fetch messages
  useEffect(() => {
    if (inquiryId) fetchMessages(inquiryId);
  }, [inquiryId]);

  const fetchMessages = async (id) => {
    try {
      const { data } = await api.get(
        `/InquiryComment/get-inquiry-comment/inquiry/${id}`
      );
      const msgs = data.map((c) => ({
        id: c.id,
        fromUser: c.commentType !== "System" && c.commentByID === currentUserId,
        text: c.commentText,
        attachmentURL: c.attachmentURL,
        fileName: c.fileName,
        attachmentType: c.attachmentType,
        createdDate: c.createdDate,
      }));
      setMessages(msgs);
    } catch (err) {
      console.error(err);
      setAlertMessage("Không tải được tin nhắn.");
      setAlertVisible(true);
    }
  };

  // Tạo inquiry mới + comment hệ thống
  const handleCreateInquiry = async () => {
    if (!inquiryText.trim()) return;
    try {
      const { data } = await api.post("/UserInquiry/create-inquiry", {
        subject: inquiryText.trim(),
      });
      const newId = data.id;
      setInquiryId(newId);
      setInquiryText("");

      // Gửi comment hệ thống
      await api.post("/InquiryComment/create-inquiry-comment", {
        inquiryID: newId,
        commentByID: currentUserId,
        commentType: "System",
        commentText: "Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.",
        attachmentURL: "",
        fileName: "",
        attachmentType: "",
      });

      fetchMessages(newId);
      // Thêm Inquiry mới vào danh sách
      setMyInquiries((prev) => [
        ...prev,
        { id: newId, subject: inquiryText.trim() },
      ]);
    } catch (err) {
      console.error(err);
      setAlertMessage("Tạo inquiry thất bại.");
      setAlertVisible(true);
    }
  };

  // Chọn inquiry hiện có
  const handleSelectInquiry = (iq) => {
    setInquiryId(iq.id);
  };

  // Mở Confirm Popup trước khi xóa
  const confirmDeleteInquiry = (id) => {
    setConfirmMessage("Bạn có chắc muốn xóa inquiry này?");
    setConfirmAction(() => () => handleDeleteInquiry(id));
    setConfirmVisible(true);
  };

  // Xóa inquiry thực tế
  const handleDeleteInquiry = async (id) => {
    setConfirmVisible(false);
    try {
      await api.delete(`/UserInquiry/delete-inquiry/${id}`);
      setMyInquiries((prev) => prev.filter((i) => i.id !== id));
      if (inquiryId === id) {
        setInquiryId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
      setAlertMessage("Xóa inquiry thất bại.");
      setAlertVisible(true);
    }
  };

  // Upload file
  const handleFileChange = async (e) => {
    if (!inquiryId) return;
    const file = e.target.files[0];
    if (!file) return;
    setAttachmentUploading(true);
    try {
      const url = await uploadFile(file, "inquiries");
      setNewAttachmentFile({ url, name: file.name, type: file.type });
    } catch (err) {
      console.error(err);
      setAlertMessage("Upload file thất bại.");
      setAlertVisible(true);
    } finally {
      setAttachmentUploading(false);
    }
  };

  // Gửi tin nhắn follow-up
  const handleSend = async () => {
    // Nếu chưa đăng nhập
    if (!currentUserId) {
      setAlertMessage("Cần đăng nhập để gửi tin nhắn");
      setAlertVisible(true);
      return;
    }
    if ((!input.trim() && !newAttachmentFile) || !inquiryId) return;
    try {
      await api.post("/InquiryComment/create-inquiry-comment", {
        inquiryID: inquiryId,
        commentByID: currentUserId,
        commentType: "Response",
        commentText: input.trim(),
        attachmentURL: newAttachmentFile?.url || "",
        fileName: newAttachmentFile?.name || "",
        attachmentType: newAttachmentFile?.type.startsWith("image/")
          ? "Image"
          : newAttachmentFile?.type.startsWith("video/")
          ? "Video"
          : "File",
      });
      fetchMessages(inquiryId);
      setInput("");
      setNewAttachmentFile(null);
    } catch (err) {
      console.error(err);
      setAlertMessage("Gửi tin nhắn thất bại.");
      setAlertVisible(true);
    }
  };

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
      d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Scroll to bottom mỗi khi có tin nhắn mới
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-indigo-600 text-white text-2xl flex items-center justify-center shadow-lg z-50"
      >
        💬
      </button>

      {/* Widget */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 max-h-[70vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {inquiryId && (
                <button
                  onClick={() => setInquiryId(null)}
                  className="text-xl"
                  title="Quay lại danh sách"
                >
                  ←
                </button>
              )}
              <span className="font-semibold">Hỏi đáp nhanh</span>
            </div>
            <button onClick={() => setOpen(false)} className="px-1">
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-2 overflow-y-auto">
            {!inquiryId ? (
              myInquiries.length === 0 ? (
                <p className="text-gray-500 text-center mt-4">
                  Bạn chưa có inquiry nào.
                </p>
              ) : (
                <ul className="space-y-2">
                  {myInquiries.map((iq) => (
                    <li key={iq.id}>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleSelectInquiry(iq)}
                          className="flex-1 text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded mr-2"
                        >
                          {iq.subject}
                        </button>
                        <button
                          onClick={() => confirmDeleteInquiry(iq.id)}
                          className="bg-red-500 text-black hover:bg-red-600 px-2 py-1 rounded"
                        >
                          Xóa
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <>
                {/* Chat messages */}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex mb-2 ${
                      m.fromUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-lg space-y-1 ${
                        m.fromUser
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p>{m.text}</p>
                      {m.attachmentURL && (
                        <div>
                          {m.attachmentType === "Image" && (
                            <img
                              src={m.attachmentURL}
                              alt={m.fileName}
                              className="max-w-full rounded"
                            />
                          )}
                          {m.attachmentType === "Video" && (
                            <video
                              controls
                              src={m.attachmentURL}
                              className="max-w-full rounded"
                            />
                          )}
                          {m.attachmentType === "File" && (
                            <a
                              href={m.attachmentURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-black underline block break-all"
                            >
                              {m.fileName}
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 text-right">
                        {formatDateTime(m.createdDate)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t flex space-x-1">
            {inquiryId && (
              <label className="cursor-pointer bg-gray-100 rounded p-2">
                📎
                <input
                  type="file"
                  accept="image/*,video/*,application/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            <input
              type="text"
              value={inquiryId ? input : inquiryText}
              onChange={(e) =>
                inquiryId
                  ? setInput(e.target.value)
                  : setInquiryText(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (inquiryId ? handleSend() : handleCreateInquiry())
              }
              placeholder={
                inquiryId ? "Nhập tin nhắn…" : "Chọn hoặc tạo Inquiry"
              }
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              onClick={inquiryId ? handleSend : handleCreateInquiry}
              className={`px-4 py-2 rounded ${
                inquiryId
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {inquiryId ? "Gửi" : "Tạo"}
            </button>
          </div>

          {/* Alert Popup */}
          {alertVisible && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
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

          {/* Confirm Popup */}
          {confirmVisible && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
                <h3 className="mb-2 text-lg font-semibold">Confirm Popup</h3>
                <p className="mb-4">{confirmMessage}</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      confirmAction();
                    }}
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
      )}
    </>
  );
}
