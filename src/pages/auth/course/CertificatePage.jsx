// src/pages/auth/course/CertificatePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";
import CertificateTemplate from "@/components/certificate/CertificateTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CertificatePage() {
  const { courseId } = useParams();
  const certRef = useRef();

  // 0) Lấy auth và tên từ localStorage
  const [memberId, setMemberId]   = useState(null);
  const [username, setUsername]   = useState("Member");
  useEffect(() => {
    const id = localStorage.getItem("id");
    if (id) {
      setMemberId(Number(id));
      const storedName = localStorage.getItem("name");
      setUsername(storedName?.trim() ? storedName : "Member");
    }
  }, []);

  // 1) Lấy title của khóa học
  const [courseTitle, setCourseTitle] = useState("");
  useEffect(() => {
    if (!courseId) return;
    api
      .get(`/Course/get-course/${courseId}`)
      .then(res => {
        setCourseTitle(res.data.title || `Course ${courseId}`);
      })
      .catch(console.error);
  }, [courseId]);

  // 2) Lấy metadata chứng chỉ
  const [certMeta, setCertMeta] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (memberId == null) return;
    setLoading(true);
    api
      .get(`/Certificate/member/${memberId}`)
      .then(res => {
        const found = res.data.find(c => c.courseId === Number(courseId));
        if (!found) throw new Error("Bạn chưa có chứng chỉ cho khóa học này!");
        setCertMeta(found);
      })
      .catch(err => setError(err.message || "Lỗi lấy metadata chứng chỉ"))
      .finally(() => setLoading(false));
  }, [memberId, courseId]);

  // 3) Lấy chi tiết chứng chỉ
  const [certDetail, setCertDetail] = useState(null);
  const [fileUrl, setFileUrl]       = useState(null);

  useEffect(() => {
    if (!certMeta) return;
    setLoading(true);
    api
      .get(`/Certificate/${certMeta.id}`)
      .then(res => {
        setCertDetail(res.data);
        if (res.data.fileUrl) {
          setFileUrl(res.data.fileUrl);
        }
      })
      .catch(() => setError("Không lấy được chi tiết chứng chỉ."))
      .finally(() => setLoading(false));
  }, [certMeta]);

  // 4) Generate PDF blob URL
  const generateBlobUrl = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { scale: 2 });
    const img    = canvas.toDataURL("image/png");
    const pdf    = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
    const blob = pdf.output("blob");
    setFileUrl(URL.createObjectURL(blob));
  };

  // === Guard clauses ===
  if (loading) return <p className="text-center py-10">Loading certificate…</p>;
  if (error)   return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!certDetail) {
    return (
      <p className="text-center py-10">
        Không tìm thấy chi tiết chứng chỉ. Vui lòng thử lại sau.
      </p>
    );
  }

  // === Render chính ===
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <h1 className="text-3xl font-semibold text-center">
          Chứng chỉ khóa học: {courseTitle || `Khóa học ${courseId}`}
        </h1>

        <div ref={certRef} className="flex justify-center">
          <CertificateTemplate
            userName={username}
            courseTitle={courseTitle}
            date={new Date(certDetail.issuedDate).toLocaleDateString("vi-VN")}
            certNo={certDetail.certificateNo}
          />
        </div>

        {!fileUrl && (
          <div className="text-center">
            <button
              onClick={generateBlobUrl}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Tạo chứng chỉ PDF
            </button>
          </div>
        )}

        {fileUrl && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <embed
                src={fileUrl}
                type="application/pdf"
                width="100%"
                height="500px"
              />
            </div>
            <div className="text-center">
              <a
                href={fileUrl}
                download={`certificate-${courseId}.pdf`}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Tải xuống chứng chỉ PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
