// src/pages/consultant/view-blog-posts/index.jsx
import React from "react";

const posts = [
  {
    type: "Blog Post",
    date: "2024-03-12",
    status: "Needs Response",
    title: "Healthy Coping Strategies",
    excerpt:
      "Discover positive ways to manage stress, emotions, and challenges without turning to harmful substances or behaviors. Learn evidence-based techniques …",
    author: "Lisa Rodriguez",
    totalComments: 2,
    pendingResponses: 2,
  },
  {
    type: "Blog Post",
    date: "2024-03-10",
    status: "Needs Response",
    title: "Building Resilience in Teens",
    excerpt:
      "Resilience is a crucial skill that helps young people bounce back from challenges and setbacks. This article explores practical strategies for develop…",
    author: "David Kim",
    totalComments: 2,
    pendingResponses: 1,
  },
  {
    type: "Blog Post",
    date: "2024-03-08",
    status: "Up to Date",
    title: "Parent Communication Guide",
    excerpt:
      "Effective communication between parents and teens is essential for prevention efforts. Learn how to create open dialogue and build trust with your tee…",
    author: "Maria Santos",
    totalComments: 1,
    pendingResponses: 0,
  },
];

export default function ViewBlogPostsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Blog Posts & Comments</h1>

      {posts.map((p) => (
        <div
          key={p.title}
          className="bg-white rounded-xl shadow p-6 flex justify-between items-start"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                {p.type}
              </span>
              <span className="text-gray-500">{p.date}</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  p.status === "Needs Response"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {p.status}
              </span>
            </div>
            <h2 className="text-xl font-semibold">{p.title}</h2>
            <p className="text-gray-600">{p.excerpt}</p>
            <p className="text-gray-500 text-sm">
              By {p.author} · {p.totalComments} total comments ·{" "}
              {p.pendingResponses} pending responses
            </p>
          </div>

          <div className="flex flex-col space-y-2 items-end">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">
              Manage Comments
            </button>
            <a href="#" className="text-blue-600 hover:underline text-sm">
              View Post
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
