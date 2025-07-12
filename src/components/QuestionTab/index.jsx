// src/components/QuestionTab.jsx
import React, { useState } from "react";
import api from "@/config/axios";

export default function QuestionTab({ categoryOptions }) {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    level: "",
    category: "",
  });
  const [editingIdx, setEditingIdx] = useState(-1);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const addOrUpdateQuestion = () => {
    const { questionText, level, category } = newQuestion;
    if (!questionText || !level || !category) {
      setAlertMessage("Vui lòng điền đầy đủ thông tin câu hỏi.");
      setAlertVisible(true);
      return;
    }
    if (editingIdx >= 0) {
      setQuestions((qs) => {
        const arr = [...qs];
        arr[editingIdx] = newQuestion;
        return arr;
      });
    } else {
      setQuestions((qs) => [...qs, newQuestion]);
    }
    setNewQuestion({ questionText: "", level: "", category: "" });
    setEditingIdx(-1);
  };

  const editQuestion = (idx) => {
    setNewQuestion(questions[idx]);
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
    setEditingIdx(idx);
  };

  const submitQuestions = async () => {
    if (questions.length === 0) {
      setAlertMessage("Chưa có câu hỏi nào để gửi.");
      setAlertVisible(true);
      return;
    }
    try {
      await api.post("Question/create-questions", questions);
      setAlertMessage("Tạo câu hỏi thành công!");
      setAlertVisible(true);
      setQuestions([]);
    } catch {
      setAlertMessage("Tạo câu hỏi thất bại.");
      setAlertVisible(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-xl font-semibold">Quản lý câu hỏi</h2>

      {/* Input row */}
      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="Question Text"
          value={newQuestion.questionText}
          onChange={(e) =>
            setNewQuestion((q) => ({ ...q, questionText: e.target.value }))
          }
          className="flex-1 border rounded px-3 py-2"
        />
        <select
          value={newQuestion.level}
          onChange={(e) =>
            setNewQuestion((q) => ({ ...q, level: e.target.value }))
          }
          className="w-40 border rounded px-3 py-2"
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
            setNewQuestion((q) => ({ ...q, category: e.target.value }))
          }
          className="w-48 border rounded px-3 py-2"
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
          onClick={addOrUpdateQuestion}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {editingIdx >= 0 ? "Cập nhật" : "+ Thêm"}
        </button>
      </div>

      {/* Danh sách câu hỏi */}
      {questions.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {questions.map((q, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 p-2 rounded"
            >
              <div>
                <span className="font-semibold">{i + 1}.</span> {q.questionText}{" "}
                <span className="text-sm text-gray-500">
                  [{q.level}, {q.category}]
                </span>
              </div>
              <button
                onClick={() => editQuestion(i)}
                className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={submitQuestions}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Gửi câu hỏi
        </button>
      </div>

      {/* Alert */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <p className="mb-4 text-indigo-800 font-semibold">{alertMessage}</p>
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
