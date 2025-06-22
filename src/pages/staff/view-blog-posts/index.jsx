import React from "react";

export default function ViewBlogPostsPage() {
  // Ví dụ data tĩnh
  const posts = [
    {
      type: "Blog Post",
      date: "2024-03-12",
      status: "Needs Response",
      title: "Healthy Coping Strategies",
      author: "Lisa Rodriguez",
      totalComments: 2,
      pending: 2,
    },
    {
      type: "Blog Post",
      date: "2024-03-10",
      status: "Needs Response",
      title: "Building Resilience in Teens",
      author: "David Kim",
      totalComments: 2,
      pending: 1,
    },
    {
      type: "Blog Post",
      date: "2024-03-08",
      status: "Up to Date",
      title: "Parent Communication Guide",
      author: "Maria Santos",
      totalComments: 1,
      pending: 0,
    },
  ];

  const statusColors = {
    "Needs Response": "bg-red-100 text-red-700",
    "Up to Date":     "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Blog Posts & Comments</h1>

      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p.title} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                  {p.type}
                </span>
                <span className="text-gray-500 text-sm">{p.date}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[p.status]}`}>
                  {p.status}
                </span>
              </div>
              <h2 className="text-xl font-semibold mt-2">{p.title}</h2>
              <p className="text-gray-600 text-sm">
                By {p.author} · {p.totalComments} total comments · {p.pending} pending responses
              </p>
            </div>
            <div className="space-x-2">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Manage Comments
              </button>
              <button className="px-4 py-2 text-indigo-600 hover:underline">
                View Post
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
);
}
