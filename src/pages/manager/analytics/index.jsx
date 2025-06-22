// src/pages/manager/analytics/index.jsx
import React from "react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">User Engagement Trends</h2>
        <div className="h-40 bg-gray-50 flex items-center justify-center text-gray-400">
          Interactive Chart Placeholder
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Course Completion Rates</h2>
          {[
            ["Understanding Substance Risks", "87%"],
            ["Handling Peer Pressure",        "92%"],
            ["Healthy Coping Strategies",     "78%"],
            ["Communication Skills",          "84%"],
          ].map(([name, pct]) => (
            <div key={name} className="flex items-center justify-between mb-3">
              <span>{name}</span>
              <span>{pct}</span>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Assessment Scores Distribution</h2>
          <div className="h-32 bg-gray-50 flex items-center justify-center text-gray-400">
            Score Distribution Chart
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold mb-4">Geographic Distribution</h2>
        <div className="h-40 bg-gray-50 flex items-center justify-center text-gray-400">
          Geographic Map Placeholder
        </div>
      </div>
    </div>
  );
}
