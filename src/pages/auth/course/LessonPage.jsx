// src/pages/auth/course/LessonPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";
import DocxViewer from "@/components/DocxViewer";

export default function LessonPage() {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const redirectParam= new URLSearchParams(useLocation().search).get("redirect");
  const userId       = localStorage.getItem("id");
  const isLoggedIn   = !!userId;

  // course & materials
  const [courseInfo, setCourseInfo]       = useState(null);
  const [materials, setMaterials]         = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [errorCourse, setErrorCourse]     = useState(null);

  // tabs
  const [activeTab, setActiveTab] = useState("video");

  // quiz attempts + questions length
  const [submissions, setSubmissions]     = useState([]);
  const [loadingSubs, setLoadingSubs]     = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz]     = useState(false);

  // detail overlay
  const [showDetail, setShowDetail]           = useState(false);
  const [selectedSub, setSelectedSub]         = useState(null);
  const [detailedQuestions, setDetailedQuestions] = useState([]);
  const [loadingDetail, setLoadingDetail]     = useState(false);

  // chỉ thay đổi phần Documents:
  const [docFile, setDocFile] = useState(null);

  // 1) Check login & fetch course + materials
  useEffect(() => {
    if (!isLoggedIn) {
      navigate(
        `/login?redirect=${encodeURIComponent(
          `/course/${courseId}/lesson${redirectParam ? `?redirect=${redirectParam}` : ""}`
        )}`,
        { replace: true }
      );
      return;
    }
    (async () => {
      try {
        setLoadingCourse(true);
        const [cRes, mRes] = await Promise.all([
          api.get(`/Course/get-course/${courseId}`),
          api.get(`/courses/${courseId}/CourseMaterial/get-materials-of-course`)
        ]);
        setCourseInfo(cRes.data);
        setMaterials(mRes.data);
      } catch (e) {
        setErrorCourse(e.response?.data?.message || e.message);
      } finally {
        setLoadingCourse(false);
      }
    })();
  }, [isLoggedIn, courseId]);

  // 2) Khi vào tab "quiz", fetch submissions + quiz questions
  useEffect(() => {
    if (activeTab !== "quiz" || !isLoggedIn) return;

    // load submissions
    (async () => {
      setLoadingSubs(true);
      try {
        const { data: allSubs } = await api.get(`/users/${userId}/quiz/submissions`);
        const ours = allSubs
          .filter(s => s.courseId === Number(courseId))
          .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
        setSubmissions(ours);
      } catch (e) {
        console.error("Lỗi fetch submissions:", e);
        setSubmissions([]);
      } finally {
        setLoadingSubs(false);
      }
    })();

    // load quiz questions để biết tổng số câu hỏi
    (async () => {
      setLoadingQuiz(true);
      try {
        const res = await api.get(`/courses/${courseId}/Quiz/get-quiz`);
        const qs = res.data.map(q => ({
          questionId:   q.questionId,
          questionText: q.questionText,
          options:      q.options || []
        }));
        setQuizQuestions(qs);
      } catch (e) {
        console.error("Lỗi fetch quiz questions:", e);
        setQuizQuestions([]);
      } finally {
        setLoadingQuiz(false);
      }
    })();
  }, [activeTab, courseId, isLoggedIn, userId]);

  // 3) Khi click vào 1 submission → load detail (giữ nguyên)

  const viewDetail = async sub => {
    setSelectedSub(sub);
    setDetailedQuestions([]);
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const { data: detail } = await api.get(`/quiz/submissions/${sub.id}`);
      const answers = detail.answers; // [{questionId, optionId, scoreValue}, ...]
      const qps = await Promise.all(
        answers.map(a =>
          api.get(`/Question/get-question/${a.questionId}`)
            .then(r => ({
              questionId:   a.questionId,
              questionText: r.data.questionText,
              options:      r.data.options,
              userAnswer:   { optionId: a.optionId, scoreValue: a.scoreValue }
            }))
        )
      );
      setDetailedQuestions(qps);
    } catch (e) {
      console.error("Lỗi fetch submission detail:", e);
      setDetailedQuestions([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 4) Mới: handleViewDocument
  const handleViewDocument = async (doc) => {
    try {
      // fetch raw .docx về ArrayBuffer
      const res = await fetch(doc.url.startsWith("/") ? doc.url : `/${doc.url}`);
      const buffer = await res.arrayBuffer();
      // gói thành File object
      const file = new File(
        [buffer],
        `${doc.title}.docx`,
        { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
      );
      setDocFile(file);
    } catch (err) {
      console.error("Không tải được tài liệu .docx:", err);
    }
  };

  if (!isLoggedIn) return null;
  if (loadingCourse) return <p className="text-center py-10">Đang tải khoá học…</p>;
  if (errorCourse)   return <p className="text-center text-red-500 py-10">{errorCourse}</p>;

  // chuẩn bị video/docs
  const videoItem = materials.find(m => m.type==="Video");
  const videoSrc  = videoItem
    ? (videoItem.url.startsWith("/") ? videoItem.url : `/${videoItem.url}`)
    : "";
  const docs = materials.filter(m => m.type==="Document");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">

        {/* Video */}
        {videoSrc
          ? <video src={videoSrc} controls className="w-full aspect-video rounded-lg shadow-lg mb-6"/>
          : <p className="text-center text-gray-500 mb-6">Không có video.</p>
        }

        {/* Course title & desc */}
        <h1 className="text-2xl font-semibold text-gray-800">{courseInfo.title}</h1>
        <p className="text-gray-600">{courseInfo.description}</p>

        {/* Tabs */}
        <div className="flex space-x-4 border-b pb-2">
          {["video","docs","quiz"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${activeTab===tab
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600"}`}
            >
              {tab==="video"? "Video"
               : tab==="docs"? "Documents"
               : "Quiz"}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        {activeTab==="video" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-medium mb-4">Lesson Overview</h2>
            <p className="text-gray-700">{courseInfo.content}</p>
          </div>
        )}

        {activeTab==="docs" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            {docs.length===0
              ? <p className="text-gray-500">Chưa có tài liệu.</p>
              : docs.map(doc=>(
                  <div key={doc.id} className="border-b pb-4">
                    <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                    <p className="text-gray-600 mb-2">{doc.description}</p>
                    <button
                      onClick={()=>handleViewDocument(doc)}
                      className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      View Document
                    </button>
                  </div>
                ))
            }

            {/* nếu đã load docFile, show DocxViewer */}
            {docFile && (
              <div className="mt-6">
                <button
                  onClick={()=>setDocFile(null)}
                  className="mb-4 text-gray-500 hover:text-gray-800"
                >
                  ✕ Đóng tài liệu
                </button>
                <DocxViewer file={docFile}/>
              </div>
            )}
          </div>
        )}

        {activeTab==="quiz" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">Quiz Attempts</h2>

            {(loadingSubs || loadingQuiz)
              ? <p>Loading quiz data…</p>
              : submissions.length===0
                ? (
                  <button
                    onClick={()=>navigate(`/course/${courseId}/quiz`)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Bắt đầu Quiz
                  </button>
                )
                : (
                  <>
                    <ul className="divide-y divide-gray-200">
                      {submissions.map(sub=>(
                        <li
                          key={sub.id}
                          className="py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                          onClick={()=>viewDetail(sub)}
                        >
                          <div>
                            <p className="font-medium">
                              {new Date(sub.submissionDate).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Score: {sub.score} / {quizQuestions.length}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            sub.passedStatus
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {sub.passedStatus ? "Passed" : "Failed"}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 text-center">
                      <button
                        onClick={()=>navigate(`/course/${courseId}/quiz`)}
                        className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Làm lại Quiz
                      </button>
                    </div>
                  </>
                )
            }
          </div>
        )}
      </div>

      {/* Detail Overlay (giữ nguyên) */}
      {showDetail && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={()=>setShowDetail(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 relative"
            onClick={e=>e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={()=>setShowDetail(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4">Chi tiết lần làm</h2>

            {loadingDetail
              ? <p>Đang tải chi tiết…</p>
              : detailedQuestions.length===0
                ? <p className="text-gray-500">Không có dữ liệu chi tiết.</p>
                : detailedQuestions.map((qObj, idx)=> {
                    const { questionText, options, userAnswer } = qObj;
                    return (
                      <div key={qObj.questionId} className="mb-6">
                        <p className="font-medium mb-2">{idx+1}. {questionText}</p>
                        <ul className="space-y-1">
                          {options.map(opt=>{
                            const chosen    = opt.id === userAnswer.optionId;
                            const correct   = chosen && userAnswer.scoreValue===1;
                            const incorrect = chosen && userAnswer.scoreValue===0;
                            return (
                              <li
                                key={opt.id}
                                className={`border-l-4 p-2 flex items-center rounded ${
                                  chosen
                                    ? correct
                                      ? "bg-green-50 border-green-500 text-green-800"
                                      : "bg-red-50   border-red-500   text-red-800"
                                    : "bg-gray-50 border-transparent text-gray-700"
                                }`}
                              >
                                {chosen && <span className="mr-2">{correct?"✅":"❌"}</span>}
                                <span>{opt.optionText}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })
            }
          </div>
        </div>
      )}
    </div>
  );
}
