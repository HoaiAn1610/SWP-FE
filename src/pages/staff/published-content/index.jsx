import React from "react";

export default function PublishedContentPage() {
  // Ví dụ data tĩnh
  const published = [
    {
      type: "Blog Post",
      date: "2024-03-12",
      title: "Healthy Coping Strategies",
      author: "Lisa Rodriguez",
      comments: 7,
    },
    {
      type: "Blog Post",
      date: "2024-03-10",
      title: "Building Resilience in Teens",
      author: "David Kim",
      comments: 12,
    },
    {
      type: "Blog Post",
      date: "2024-03-08",
      title: "Parent Communication Guide",
      author: "Maria Santos",
      comments: 5,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Published Content</h1>

      <div className="space-y-4">
        {published.map((p) => (
          <div key={p.title} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
            <div>
              <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                {p.type}
              </div>
              <span className="text-gray-500 text-sm ml-2">{p.date}</span>
              <h2 className="text-xl font-semibold mt-2">{p.title}</h2>
              <p className="text-gray-600 text-sm">
                By {p.author} · {p.comments} comments
              </p>
            </div>
            <div className="space-x-2">
              <button className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
                Edit
              </button>
              <button className="px-4 py-2 text-indigo-600 hover:underline">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
