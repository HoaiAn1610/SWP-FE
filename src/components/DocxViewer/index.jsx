// src/components/DocxViewer.jsx
import React, { useState, useEffect } from "react";
import mammoth from "mammoth";

export default function DocxViewer({ file }) {
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError]             = useState("");

  useEffect(() => {
    if (!file) return;

    (async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(html);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Không đọc được file .docx");
      }
    })();
  }, [file]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!htmlContent) return <p>Đang tải nội dung tài liệu…</p>;

  return (
    <div
      className="prose max-w-none bg-white p-6 rounded shadow"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
