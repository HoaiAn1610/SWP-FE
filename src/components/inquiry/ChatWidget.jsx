// src/components/ChatWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import api from "@/config/axios";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  // Inquiry flow
  const [myInquiries, setMyInquiries] = useState([]);
  const [inquiryId, setInquiryId] = useState(null);
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryModal, setInquiryModal] = useState(false);
  const [inquiryText, setInquiryText] = useState("");

  // Chat flow
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const endRef = useRef();

  // Load my inquiries
  useEffect(() => {
    if (open && !inquiryId) {
      api
        .get("/UserInquiry/myInquiries")
        .then(({ data }) => setMyInquiries(data))
        .catch((err) => console.error(err));
    }
  }, [open, inquiryId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create new inquiry
  const handleCreateInquiry = async () => {
    if (!inquiryText.trim()) return;
    try {
      const { data } = await api.post("/UserInquiry/create-inquiry", {
        subject: inquiryText.trim(),
      });
      setInquiryId(data.id);
      setInquirySubject(data.subject);
      setMessages([{ from: "user", text: data.subject }]);
      setInquiryModal(false);
      setInquiryText("");
    } catch {
      alert("Tạo inquiry thất bại.");
    }
  };

  // Select existing inquiry
  const handleSelectInquiry = (iq) => {
    setInquiryId(iq.id);
    setInquirySubject(iq.subject);
    setMessages([{ from: "user", text: iq.subject }]);
  };

  // Send follow-up message (stub)
  const handleSend = () => {
    if (!input.trim() || !inquiryId) return;
    setMessages((ms) => [...ms, { from: "user", text: input.trim() }]);
    setInput("");
    // TODO: gửi API tin nhắn follow-up
  };

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
              // Danh sách myInquiries
              myInquiries.length === 0 ? (
                <p className="text-gray-500 text-center mt-4">
                  Bạn chưa có inquiry nào.
                </p>
              ) : (
                <ul className="space-y-2">
                  {myInquiries.map((iq) => (
                    <li key={iq.id}>
                      <button
                        onClick={() => handleSelectInquiry(iq)}
                        className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {iq.subject}
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              // Chat messages
              <>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.from === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-lg ${
                        m.from === "user"
                          ? "bg-indigo-100 text-indigo-900"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                inquiryId ? "Nhập tin nhắn…" : "Chọn hoặc tạo Inquiry"
              }
              disabled={!inquiryId}
              className="flex-1 border rounded-l-lg px-3 py-2 disabled:bg-gray-100"
            />
            <button
              onClick={handleSend}
              disabled={!inquiryId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-r-lg disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      {/* Modal tạo inquiry */}
      {inquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Hỏi Vấn Đề</h2>
            <textarea
              rows={4}
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              placeholder="Mô tả vấn đề…"
              className="w-full border rounded p-2 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setInquiryModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateInquiry}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Gửi Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
