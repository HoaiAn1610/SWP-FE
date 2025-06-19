// src/components/ErrorPage.jsx
import React from "react";
import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>Oops! Đã có lỗi xảy ra.</h1>
      <p>
        {error.status ? `${error.status} — ${error.statusText}` : error.message}
      </p>
    </div>
  );
};

export default ErrorPage;
