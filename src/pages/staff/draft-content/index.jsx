import React from "react";

export default function DraftContentPage() {
  // Ví dụ data tĩnh, bạn có thể gọi API để lấy thật
  const drafts = [
    {
      type: "Blog Post",
      date: "2024-03-15",
      title: "Understanding Teen Brain Development",
      author: "Sarah Johnson",
      comments: 3,
    },
    {
      type: "Course Material",
      date: "2024-03-14",
      title: "Handling Peer Pressure Course",
      author: "Mike Chen",
      comments: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Draft Content</h1>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Create New Content
        </button>
      </div>

      <div className="space-y-4">
        {drafts.map((d) => (
          <div key={d.title} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
            <div>
              <div className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                {d.type}
              </div>
              <span className="text-gray-500 text-sm ml-2">{d.date}</span>
              <h2 className="text-xl font-semibold mt-2">{d.title}</h2>
              <p className="text-gray-600 text-sm">
                By {d.author} · {d.comments} comments
              </p>
            </div>
            <div className="space-x-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Send for Approval
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Edit Draft
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
