import React from "react";
import { Link } from "react-router-dom";
import ConsultantHeader from "../ConsultantHeader ";
// Giữ nguyên Header như trên
const Header = () => {
  const username = localStorage.getItem("name") || "Member";
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/consultant/blog-qa">
          <img src="/logo192.png" alt="Logo" className="h-10" />
        </Link>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default function BlogQAPage() {
  return (
    <div className="min-h-screen bg-gray-50">


      <div className="flex">
        {/* <aside className="w-64 bg-white shadow p-4 space-y-2">
          <Link
            to="/consultant/appointments"
            className="block px-3 py-2 rounded hover:bg-gray-100"
          >
            Appointments
          </Link>
          <Link
            to="/consultant/create-content"
            className="block px-3 py-2 rounded hover:bg-gray-100"
          >
            Create Content
          </Link>
          <Link
            to="/consultant/blog-qa"
            className="block px-3 py-2 rounded hover:bg-gray-100 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
          >
            Blog Q&A
          </Link>
        </aside> */}

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-4">Blog Q&A</h1>
          <ul className="space-y-4">
            {[
              { q: "How to cope with anxiety?", by: "John D." },
              { q: "Recommended resources?", by: "Mary S." },
            ].map((item) => (
              <li key={item.q} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{item.q}</div>
                    <div className="text-gray-600 text-sm">
                      Asked by {item.by}
                    </div>
                  </div>
                  <button className="text-purple-600 hover:underline">
                    Answer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
