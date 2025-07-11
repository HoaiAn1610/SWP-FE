import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";
import QuestionCard from "@/components/courses/QuestionCard";

export default function QuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Trạng thái chung
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sau khi submit
  const [result, setResult] = useState(null);
  const [submissionDetail, setSubmissionDetail] = useState(null);

  // Alert/Confirm states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };
  const showConfirm = (msg, action) => {
    setConfirmMessage(msg);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  // 1) Lấy câu hỏi quiz
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/courses/${courseId}/Quiz/get-quiz`);
        const mapped = res.data.map((q) => ({
          id: q.questionId,
          questionText: q.questionText,
          options: (q.options || []).map((o) => ({ id: o.id, text: o.optionText })),
        }));
        setQuestions(mapped);
      } catch (err) {
        showAlert(err.response?.data?.message || err.message || "Không thể tải quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [courseId]);

  // 2) Chọn đáp án
  const handleAnswer = (questionId, optionId) => {
    setAnswers((a) => ({ ...a, [questionId]: optionId }));
  };

  // 3) Next / Submit
  const handleNext = async () => {
    const isLast = currentIndex === questions.length - 1;
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    // Submit
    const payload = questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] }));
    try {
      setLoading(true);
      const res = await api.post(
        `/courses/${courseId}/Quiz/submit-answers`,
        payload
      );
      const { id, score, passedStatus } = res.data;
      const total = res.data.total ?? questions.length;
      setResult({ id, score, total, passedStatus });
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || "Gửi đáp án thất bại");
    } finally {
      setLoading(false);
    }
  };

  // 4) Lấy chi tiết submission
  useEffect(() => {
    if (!result) return;
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/quiz/submissions/${result.id}`);
        setSubmissionDetail(res.data);
      } catch (err) {
        console.error("Không lấy được chi tiết submission:", err);
      }
    };
    fetchDetail();
  }, [result]);

  // Nội dung hiển thị
  let content;
  if (loading) {
    content = <p className="text-center py-10">Đang tải bài kiểm tra…</p>;
  } else if (error) {
    content = <p className="text-center text-red-500 py-10">{error}</p>;
  } else if (result) {
    content = (
      <>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-semibold">Hoàn thành bài kiểm tra!</h1>
          <p className="text-lg">
            Điểm số của bạn: <span className="font-bold text-indigo-600">{result.score}</span> / <span className="font-bold text-indigo-600">{result.total}</span>
          </p>
          <p className={`text-2xl font-bold ${result.passedStatus ? "text-green-600" : "text-red-600"}`}>
            {result.passedStatus ? "Bạn đã vượt qua! 🎉" : "Chưa vượt qua. 😔"}
          </p>
        </div>
        {submissionDetail?.answers && (
          <div className="bg-white p-6 rounded-lg shadow-lg divide-y divide-gray-200">
            <h2 className="text-xl font-semibold mb-4">Kết quả chi tiết</h2>
            {questions.map((q, idx) => {
              const detail = submissionDetail.answers.find((a) => a.questionId === q.id);
              return (
                <div key={q.id} className="py-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{idx + 1}. {q.questionText}</h3>
                  <ul className="space-y-2">
                    {q.options.map((o) => {
                      const isChosen = detail.optionId === o.id;
                      const correct = detail.scoreValue === 1;
                      const borderColor = isChosen
                        ? (correct ? "border-green-500" : "border-red-500")
                        : "border-transparent";
                      const bgColor = isChosen
                        ? (correct ? "bg-green-50" : "bg-red-50")
                        : "bg-gray-50 hover:bg-gray-100";
                      const textColor = isChosen
                        ? (correct ? "text-green-800" : "text-red-800")
                        : "text-gray-700";
                      return (
                        <li
                          key={o.id}
                          className={`border-l-4 ${borderColor} ${bgColor} ${textColor} px-4 py-2 rounded-md flex items-center transition`}
                        >
                          <span>{o.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        {result.passedStatus && (
          <div className="flex justify-center space-x-4 pt-6">
            <button
              onClick={() => navigate(`/course/${courseId}/certificate`)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Xem chứng chỉ
            </button>
          </div>
        )}
        <div className="flex justify-center space-x-4 pt-6">
          <button
            onClick={() => navigate(`/course/${courseId}/lesson`)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Về bài học
          </button>
          <button
            onClick={() => navigate("/course")}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Về danh sách khóa học
          </button>
        </div>
      </>
    );
  } else {
    const current = questions[currentIndex];
    content = (
      <>
        <h1 className="text-2xl font-semibold">
          Bài kiểm tra – Câu hỏi {currentIndex + 1} trên {questions.length}
        </h1>
        <QuestionCard
          question={current}
          selectedAnswer={answers[current.id]}
          onAnswer={(optId) => handleAnswer(current.id, optId)}
        />
        <div className="text-right">
          <button
            onClick={handleNext}
            disabled={answers[current.id] == null}
            className={`px-6 py-2 rounded ${answers[current.id] != null ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
          >
            {currentIndex < questions.length - 1 ? "Tiếp theo" : "Gửi kết quả"}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        {content}
      </div>

      {/* Alert */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{alertMessage}</p>
            <button onClick={() => setAlertVisible(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Đồng Ý</button>
          </div>
        </div>
      )}

      {/* Confirm */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{confirmMessage}</p>
            <div className="flex justify-center space-x-2">
              <button onClick={hideConfirm} className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md">Hủy</button>
              <button onClick={() => { confirmAction(); hideConfirm(); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Đồng Ý</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
