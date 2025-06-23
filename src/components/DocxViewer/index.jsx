// src/components/DocxViewer.jsx
import React, { useState } from "react";
import mammoth from "mammoth";

export default function DocxViewer() {
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlContent(html);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Không đọc được file .docx");
    }
  };

  return (
    <div className="space-y-4">
      <label className="block font-medium">Chọn file .docx:</label>
      <input
        type="file"
        accept=".docx"
        onChange={handleFile}
        className="border rounded px-3 py-2"
      />

      {error && <p className="text-red-500">{error}</p>}

      {htmlContent && (
        <div
          className="prose max-w-none bg-white p-6 rounded shadow"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}
    </div>
  );
}
