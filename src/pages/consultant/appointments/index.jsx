import React from "react";
import { Link } from "react-router-dom";
import ConsultantHeader from "../ConsultantHeader ";
// Header đơn giản: logo + dropdown user
const Header = () => {
  const username = localStorage.getItem("name") || "Member";
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/consultant/appointments">
          <img src="/logo192.png" alt="Logo" className="h-10" />
        </Link>
        <div className="relative">
          <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
            <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
              {username.slice(0, 1)}
            </span>
            <span className="font-medium">{username}</span>
          </button>
          {/* Dropdown đơn giản */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow border">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function AppointmentsPage() {
  const sessions = [
    {
      id: 1,
      name: "Sarah Johnson",
      time: "9:00 AM",
      dur: "60 min",
      status: "Confirmed",
      clr: "blue",
    },
    {
      id: 2,
      name: "Michael Chen",
      time: "10:30 AM",
      dur: "45 min",
      status: "Confirmed",
      clr: "blue",
    },
    {
      id: 3,
      name: "Emma Davis",
      time: "2:00 PM",
      dur: "30 min",
      status: "Urgent",
      clr: "yellow",
    },
    {
      id: 4,
      name: "David Wilson",
      time: "3:30 PM",
      dur: "90 min",
      status: "Pending",
      clr: "gray",
    },
  ];
  const upcoming = [
    { day: "Monday, March 18", cnt: 5, clr: "blue" },
    { day: "Tuesday, March 19", cnt: 3, clr: "yellow" },
    { day: "Wednesday, March 20", cnt: 2, clr: "gray" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsultantHeader />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow p-4 space-y-2">
          <Link
            to="/consultant/appointments"
            className="block px-3 py-2 rounded hover:bg-gray-100 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
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
            className="block px-3 py-2 rounded hover:bg-gray-100"
          >
            Blog Q&A
          </Link>
        </aside>

        {/* Nội dung chính */}
        <main className="flex-1 p-6 space-y-8">
          {/* Tiêu đề + nút */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">Today's Schedule</h1>
              <p className="text-gray-600">Friday, March 15, 2024</p>
            </div>
            <div className="space-x-4">
              <button className="px-4 py-2 bg-purple-600 text-white rounded">
                Add Appointment
              </button>
              <button className="px-4 py-2 border rounded">
                View Calendar
              </button>
            </div>
          </div>

          {/* Thẻ sessions */}
          <div className="grid grid-cols-2 gap-6">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`border-2 rounded p-4 border-${s.clr}-500`}
              >
                <div className="flex justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {s.name.match(/\b\w/g)}
                    </div>
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-gray-500 text-sm">{/* type */}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{s.time}</div>
                    <div className="text-gray-500 text-sm">{s.dur}</div>
                  </div>
                </div>
                <span
                  className={`mt-2 inline-block px-2 py-1 rounded-full bg-${s.clr}-100 text-${s.clr}-700`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Upcoming This Week</h2>
            <div className="space-y-2">
              {upcoming.map((u) => (
                <div
                  key={u.day}
                  className="flex justify-between p-3 border rounded"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-3 h-3 rounded-full bg-${u.clr}-500`}
                    ></span>
                    <span>{u.day}</span>
                  </div>
                  <span className="text-gray-600">{u.cnt} appointments</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
