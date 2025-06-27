import React, { useState } from "react";
import ViewAppointments from "./ViewAppointments";
import CreateAppointment from "./CreateAppointment";

export default function AppointmentsPage() {
  // mock data
  const sessions = [
    {
      id: 1,
      name: "Sarah Johnson",
      time: "09:00",
      dur: "60",
      status: "Confirmed",
      clr: "blue",
    },
    {
      id: 2,
      name: "Michael Chen",
      time: "10:30",
      dur: "45",
      status: "Confirmed",
      clr: "blue",
    },
    {
      id: 3,
      name: "Emma Davis",
      time: "14:00",
      dur: "30",
      status: "Urgent",
      clr: "yellow",
    },
    {
      id: 4,
      name: "David Wilson",
      time: "15:30",
      dur: "90",
      status: "Pending",
      clr: "gray",
    },
  ];
  const upcoming = [
    { day: "Monday, March 18", cnt: 5, clr: "blue" },
    { day: "Tuesday, March 19", cnt: 3, clr: "yellow" },
    { day: "Wednesday, March 20", cnt: 2, clr: "gray" },
  ];

  const [activeTab, setActiveTab] = useState("view"); // 'view' | 'create'

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex space-x-4 border-b mb-4">
          <button
            onClick={() => setActiveTab("view")}
            className={`px-4 py-2 -mb-px font-medium ${
              activeTab === "view"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Xem Cuộc Hẹn
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 -mb-px font-medium ${
              activeTab === "create"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Tạo Cuộc Hẹn
          </button>
        </div>

        {/* Nội dung tab */}
        {activeTab === "view" ? (
          <ViewAppointments sessions={sessions} upcoming={upcoming} />
        ) : (
          <CreateAppointment />
        )}
      </main>
    </div>
  );
}
