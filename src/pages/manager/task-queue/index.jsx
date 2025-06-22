// src/pages/manager/task-queue/index.jsx
import React from "react";

export default function TaskQueuePage() {
  const tasks = [
    "Review Q1 Prevention Course Content",
    "Approve Student Assessment Framework",
    "Update Parent Resource Guide",
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Task Approval Queue</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-sm text-gray-500 mb-2">
          {tasks.length} pending
        </div>
        <ul className="space-y-3">
          {tasks.map((t) => (
            <li key={t} className="border rounded px-4 py-3">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
