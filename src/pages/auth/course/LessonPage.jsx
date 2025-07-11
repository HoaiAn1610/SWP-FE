import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";
import DocxViewer from "@/components/DocxViewer";

const normalizeUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
};

export default function LessonPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("id");
  const isLoggedIn = !!userId;

  // Popup state
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

  // Quiz metadata from server
  const [quizAttemptCount, setQuizAttemptCount] = useState(0);
  const [hasPassed, setHasPassed] = useState(false);

  // Persist enrollment timestamp
  const enrollmentKey = `enroll_ts_${courseId}`;
  const [lastEnrollTime, setLastEnrollTime] = useState(() => {
    const saved = localStorage.getItem(enrollmentKey);
    if (saved) return parseInt(saved, 10);
    const now = Date.now();
    localStorage.setItem(enrollmentKey, String(now));
    return now;
  });
  const updateEnrollment = () => {
    const now = Date.now();
    localStorage.setItem(enrollmentKey, String(now));
    setLastEnrollTime(now);
  };

  // Course & materials
  const [courseInfo, setCourseInfo] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [errorCourse, setErrorCourse] = useState(null);

  // Tabs
  const [activeTab, setActiveTab] = useState("video");

  // Quiz submissions & questions
  const [submissions, setSubmissions] = useState([]);
  const [oldSubmissions, setOldSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Detail overlay
  const [showDetail, setShowDetail] = useState(false);
  const [detailedQuestions, setDetailedQuestions] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Document viewer scroll
  const [docFile, setDocFile] = useState(null);
  const scrollContainerRef = useRef(null);
  const [hasScrolledDocs, setHasScrolledDocs] = useState(false);

  // Video tracking
  const videoRef = useRef(null);
  const [maxTime, setMaxTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const WATCH_THRESHOLD = 0.8;

  // Fetch enrollment metadata (quizAttemptCount)
  useEffect(() => {
    if (!isLoggedIn) return;
    api
      .get(`/CourseEnrollment/courses/${courseId}/enrollment-status`)
      .then((res) => setQuizAttemptCount(res.data.quizAttemptCount || 0))
      .catch(() => {});
  }, [isLoggedIn, courseId]);

  // Fetch course & materials
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        setLoadingCourse(true);
        const [cRes, mRes] = await Promise.all([
          api.get(`/Course/get-course/${courseId}`),
          api.get(
            `/courses/${courseId}/CourseMaterial/get-materials-of-course`
          ),
        ]);
        setCourseInfo(cRes.data);
        setMaterials(mRes.data);
      } catch (e) {
        showAlert(e.response?.data?.message || e.message);
        setErrorCourse(e.response?.data?.message || e.message);
      } finally {
        setLoadingCourse(false);
      }
    })();
  }, [isLoggedIn, courseId]);

  // Fetch quiz submissions
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      setLoadingSubs(true);
      try {
        const { data } = await api.get(`/users/${userId}/quiz/submissions`);
        const all = data.filter((s) => s.courseId === Number(courseId));
        const enrollTimestamp =
          typeof lastEnrollTime === "string"
            ? new Date(lastEnrollTime).getTime()
            : lastEnrollTime;
        const current = all.filter(
          (s) => new Date(s.submissionDate).getTime() >= enrollTimestamp
        );
        const old = all.filter(
          (s) => new Date(s.submissionDate).getTime() < enrollTimestamp
        );
        setSubmissions(current);
        setOldSubmissions(old);
        // Check passed on all history
        setHasPassed(all.some((s) => s.passedStatus === true));
      } catch {
      } finally {
        setLoadingSubs(false);
      }
    })();
  }, [isLoggedIn, courseId, userId, lastEnrollTime]);

  // Load quiz questions when on quiz tab
  useEffect(() => {
    if (activeTab !== "Bài kiểm Tra" || !isLoggedIn) return;
    (async () => {
      setLoadingQuiz(true);
      try {
        const res = await api.get(`/courses/${courseId}/Quiz/get-quiz`);
        setQuizQuestions(res.data);
      } catch (e) {
        showAlert(e.response?.data?.message || e.message);
      } finally {
        setLoadingQuiz(false);
      }
    })();
  }, [activeTab, courseId, isLoggedIn]);

  // Video handlers
  const handleLoadedMeta = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };
  const handleTimeUpdate = () => {
    if (videoRef.current)
      setMaxTime((p) => Math.max(p, videoRef.current.currentTime));
  };
  const handleSeeking = () => {
    if (videoRef.current && videoRef.current.currentTime > maxTime + 0.05)
      videoRef.current.currentTime = maxTime;
  };
  const handleSeeked = () => {
    if (!videoRef.current) return;
    setTimeout(() => {
      if (videoRef.current.currentTime > maxTime + 0.05)
        videoRef.current.currentTime = maxTime;
    }, 50);
  };

  // Document scroll
  const onDocScroll = () => {
    const c = scrollContainerRef.current;
    if (c && c.scrollTop + c.clientHeight >= c.scrollHeight - 10)
      setHasScrolledDocs(true);
  };

  // Start Quiz button navigates directly (backend auto-increments count)
  const handleStartQuiz = () => navigate(`/course/${courseId}/quiz`);

  // Tab switch logic using quizAttemptCount

  const handleTabClick = (tab) => {
    if (tab === "Bài kiểm Tra") {

  const handleTabClick = tab => {
    if (tab === "Bài kiểm Tra") {

      // If 3 attempts used without passing, ask to reset
      if (quizAttemptCount === 3 && !hasPassed) {
        showConfirm(
          "Bạn đã thử làm Quiz 3 lần mà chưa qua. Bạn có muốn bắt đầu lại khóa học không?",
          async () => {
            try {
              await api.delete(
                `/CourseEnrollment/courses/${courseId}/unenroll`
              );
              await api.post(`/CourseEnrollment/courses/${courseId}/enroll`);
              updateEnrollment();
              const res = await api.get(
                `/CourseEnrollment/courses/${courseId}/enrollment-status`
              );
              setQuizAttemptCount(res.data.quizAttemptCount || 0);
              setHasPassed(false);
              setMaxTime(0);
              setHasScrolledDocs(false);
              showAlert("Bạn đã bắt đầu lại khóa học thành công.");
            } catch {
              showAlert("Có lỗi khi khởi động lại khóa học.");
            }
          }
        );
        return;
      }
      // Enforce view requirements only if no prior attempts
      if (quizAttemptCount === 0 && !hasPassed) {
        const watchedRatio = duration > 0 ? maxTime / duration : 0;
        if (watchedRatio < WATCH_THRESHOLD) {
          showAlert(
            `Bạn phải xem ít nhất ${Math.round(
              WATCH_THRESHOLD * 100
            )}% video trước khi làm Quiz.`
          );
          return;
        }
        if (materials.some((m) => m.type === "Document") && !hasScrolledDocs) {
          showAlert("Bạn phải cuộn tài liệu xuống cuối để làm Quiz.");
          return;
        }
      }
    }
    setActiveTab(tab);
  };

  // View document handler
  const handleViewDocument = async (doc) => {
    try {
      const buffer = await (await fetch(normalizeUrl(doc.url))).arrayBuffer();
      setDocFile(
        new File([buffer], `${doc.title}.docx`, {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
      );
      setHasScrolledDocs(false);
      setActiveTab("Tài Liệu");
    } catch {
      showAlert("Không tải được tài liệu.");
    }
  };

  const viewDetail = async (sub) => {
    setShowDetail(true);
    setDetailedQuestions([]);
    setLoadingDetail(true);
    try {
      const { data: detail } = await api.get(`/quiz/submissions/${sub.id}`);
      const qps = await Promise.all(
        detail.answers.map((a) =>
          api.get(`/Question/get-question/${a.questionId}`).then((r) => ({
            questionId: a.questionId,
            questionText: r.data.questionText,
            options: r.data.options,
            userAnswer: { optionId: a.optionId, scoreValue: a.scoreValue },
          }))
        )
      );
      setDetailedQuestions(qps);
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      showAlert(msg);
      setDetailedQuestions([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Render omitted for brevity...
  if (!isLoggedIn) return null;
  if (loadingCourse)
    return <p className="text-center py-10">Đang tải khóa học…</p>;
  if (errorCourse)
    return <p className="text-center text-red-500 py-10">{errorCourse}</p>;

  const videoItem = materials.find((m) => m.type === "Video");
  const videoSrc = normalizeUrl(videoItem?.url);
  const docs = materials.filter((m) => m.type === "Document");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        {/* Video Section */}
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            className="w-full aspect-video rounded-lg shadow-lg mb-6"
            onLoadedMetadata={handleLoadedMeta}
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            onSeeked={handleSeeked}
          />
        ) : (
          <p className="text-center text-gray-500 mb-6">Không có video.</p>
        )}

        <h1 className="text-2xl font-semibold text-gray-800">
          {courseInfo.title}
        </h1>
        <p className="text-gray-600">{courseInfo.description}</p>

        {/* Tabs */}
        <div className="flex space-x-4 border-b pb-2">
          {["video", "Tài Liệu", "Bài kiểm Tra"].map((tab) => (

          {['video', 'Tài Liệu', 'Bài kiểm Tra'].map(tab => (

            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`${
                activeTab === tab
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600"
              } pb-2`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Panels */}
        {activeTab === "video" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-medium mb-4">Tổng Quan Khóa Học</h2>
            <p className="text-gray-700 ">{courseInfo.content}</p>

            <h2 className="text-xl font-medium mb-4">Tổng Quan Khóa Học</h2>
            <p className="text-gray-700 ">{courseInfo.content}</p>
          </div>
        )}

        {activeTab === "Tài Liệu" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            {docs.length === 0 ? (
              <p className="text-gray-500">Chưa có tài liệu.</p>
            ) : (
              docs.map((doc) => (
                <div key={doc.id} className="border-b pb-4">
                  <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                  <p className="text-gray-600 mb-2">{doc.description}</p>
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Xem Tài Liệu
                  </button>
                </div>
              ))
            )}

            {docFile && (
              <div className="mt-6">
                <button
                  onClick={() => setDocFile(null)}
                  className="mb-4 text-gray-500 hover:text-gray-800"
                >
                  ✕ Đóng tài liệu
                </button>
                <div
                  ref={scrollContainerRef}
                  onScroll={onDocScroll}
                  className="max-h-[60vh] overflow-auto border p-2 whitespace-pre-wrap"
                >
                  <DocxViewer file={docFile} />
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'Tài Liệu' && (
  <div className="bg-white p-6 rounded-lg shadow space-y-4">
    {docs.length === 0 ? (
      <p className="text-gray-500">Chưa có tài liệu.</p>
    ) : (
      docs.map(doc => (
        <div key={doc.id} className="border-b pb-4">
          <h3 className="font-semibold text-gray-800">{doc.title}</h3>
          <p className="text-gray-600 mb-2">{doc.description}</p>
          <button
            onClick={() => handleViewDocument(doc)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Xem Tài Liệu
          </button>
        </div>
      ))
    )}

    {docFile && (
      <div className="mt-6">
        <button
          onClick={() => setDocFile(null)}
          className="mb-4 text-gray-500 hover:text-gray-800"
        >
          ✕ Đóng tài liệu
        </button>
        <div
          ref={scrollContainerRef}
          onScroll={onDocScroll}
          className="max-h-[60vh] overflow-auto border p-2 whitespace-pre-wrap"
        >
          <DocxViewer file={docFile} />
        </div>
      </div>
    )}
  </div>
)}

        {activeTab === "Bài kiểm Tra" && (
         {activeTab==='Bài kiểm Tra' && (

          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">Bài Kiểm Tra</h2>
            {!hasPassed ? (
              <button
                onClick={handleStartQuiz}
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {quizAttemptCount === 0 ? "Bắt đầu Quiz" : "Làm lại Quiz"}
              </button>
            ) : (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 mb-2">
                  Bạn đã hoàn thành khóa học!
                </p>

                <p className="text-green-800 mb-2">Bạn đã hoàn thành khóa học!</p>
                <button
                  onClick={() => navigate(`/course/${courseId}/certificate`)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Xem Chứng Chỉ
                </button>
                onClick={() => navigate(`/course/${courseId}/certificate`)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Xem Chứng Chỉ
              </button>
              </div>
            )}

            {loadingSubs || loadingQuiz ? (
              <p>Đang tải dữ liệu...</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {submissions.map((sub) => (
                  <li
                    key={sub.id}
                    className="py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                    onClick={() => viewDetail(sub)}
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(sub.submissionDate).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Điểm {sub.score} / {quizQuestions.length}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        sub.passedStatus
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sub.passedStatus ? "Passed" : "Failed"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {(loadingSubs||loadingQuiz)?<p>Đang tải dữ liệu...</p>:<ul className="divide-y divide-gray-200">
              {submissions.map(sub=>(
                <li key={sub.id} className="py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer" onClick={()=>viewDetail(sub)}>
                  <div>
                    <p className="font-medium">{new Date(sub.submissionDate).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Điểm {sub.score} / {quizQuestions.length}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-sm ${sub.passedStatus?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{sub.passedStatus?'Passed':'Failed'}</span>
                </li>
              ))}
            </ul>}

            {oldSubmissions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium">Lịch sử</h3>
                <ul className="divide-y divide-gray-200 mt-2">
                  {oldSubmissions.map((sub) => (
                    <li
                      key={sub.id}
                      onClick={() => viewDetail(sub)}
                      className="py-2 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(sub.submissionDate).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Điểm: {sub.score} / {quizQuestions.length}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          sub.passedStatus
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {sub.passedStatus ? "Passed" : "Failed"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
{oldSubmissions.length > 0 && (
  <div className="mt-6">
    <h3 className="text-lg font-medium">Lịch sử</h3>
    <ul className="divide-y divide-gray-200 mt-2">
      {oldSubmissions.map(sub => (
        <li
          key={sub.id}
          onClick={() => viewDetail(sub)}
          className="py-2 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
        >
          <div>
            <p className="font-medium">
              {new Date(sub.submissionDate).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Điểm: {sub.score} / {quizQuestions.length}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              sub.passedStatus
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {sub.passedStatus ? 'Passed' : 'Failed'}
          </span>
        </li>
      ))}
    </ul>
  </div>
)}

          </div>
        )}
      </div>

      {/* Detail overlay */}
      {showDetail && (

        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowDetail(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4">Chi tiết lần làm</h2>

            {loadingDetail ? (
              <p>Đang tải chi tiết…</p>
            ) : detailedQuestions.length === 0 ? (
              <p className="text-gray-500">Không có dữ liệu chi tiết.</p>
            ) : (
              detailedQuestions.map((qObj, idx) => {
                const { questionText, options, userAnswer } = qObj;
                return (
                  <div key={qObj.questionId} className="mb-6">
                    <p className="font-medium mb-2">
                      {idx + 1}. {questionText}
                    </p>
                    <ul className="space-y-1">
                      {options.map((opt) => {
                        const chosen = opt.id === userAnswer.optionId;
                        const correct = chosen && userAnswer.scoreValue === 1;
                        return (
                          <li
                            key={opt.id}
                            className={`border-l-4 p-2 flex items-center rounded ${
                              chosen
                                ? correct
                                  ? "bg-green-50 border-green-500 text-green-800"
                                  : "bg-red-50 border-red-500 text-red-800"
                                : "bg-gray-50 border-transparent text-gray-700"
                            }`}
                          >
                            {chosen && (
                              <span className="mr-2">
                                {correct ? "✅" : "❌"}
                              </span>
                            )}
                            {opt.optionText}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Alert */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{alertMessage}</p>

            <button
              onClick={() => setAlertVisible(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              ĐỒng Ý
            </button>

            <button onClick={() => setAlertVisible(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">ĐỒng Ý</button>

          </div>
        </div>
      )}

      {/* Confirm */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">
              {confirmMessage}
            </p>
            <div className="flex justify-center space-x-2">

              <button
                onClick={hideConfirm}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  confirmAction();
                  hideConfirm();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                Đồng Ý
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
