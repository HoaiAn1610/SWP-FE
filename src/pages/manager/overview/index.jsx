// vd: src/pages/manager/overview/index.jsx
import React from "react";

const OverviewPage = () => (
  <div className="space-y-6">
    {/* Metric cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { title: "User Signups", value: "1,247", change: "+14.5%" },
        { title: "Completed Surveys", value: "892", change: "+18%" },
        { title: "Appointments Booked", value: "234", change: "+18.2%" },
        { title: "Program Completion", value: "87.3%", change: "+6.3%" },
      ].map((c) => (
        <div key={c.title} className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">{c.title}</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{c.value}</div>
          <div className="text-green-500 text-sm mt-1">{c.change}</div>
        </div>
      ))}
    </div>

    {/* Recent Activity & Quick Actions */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <ul className="space-y-3">
          <li className="flex items-start space-x-3">
            <span className="inline-block w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</span>
            <div>
              <div className="font-medium">New course completion</div>
              <div className="text-sm text-gray-500">Sarah M. completed “Handling Peer Pressure”</div>
            </div>
          </li>
          <li className="flex items-start space-x-3">
            <span className="inline-block w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">📝</span>
            <div>
              <div className="font-medium">Assessment submitted</div>
              <div className="text-sm text-gray-500">Mike C. submitted prevention assessment</div>
            </div>
          </li>
          <li className="flex items-start space-x-3">
            <span className="inline-block w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">📅</span>
            <div>
              <div className="font-medium">Appointment scheduled</div>
              <div className="text-sm text-gray-500">Parent consultation booked for tomorrow</div>
            </div>
          </li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { text: "Add New Course", icon: "+" },
            { text: "Review Assessments", icon: "✉️" },
            { text: "Manage Team", icon: "👥" },
            { text: "Export Reports", icon: "⬇️" },
          ].map((a) => (
            <button
              key={a.text}
              className="flex items-center justify-between p-4 border rounded hover:bg-indigo-50"
            >
              <span className="text-xl">{a.icon}</span>
              <span className="font-medium">{a.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);


export default OverviewPage; // ← export default ở cuối
