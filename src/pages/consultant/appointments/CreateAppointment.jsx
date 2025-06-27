import React, { useState } from "react";

export default function CreateAppointment() {
  const [form, setForm] = useState({
    name: "",
    time: "",
    duration: "",
    status: "Pending",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: gọi api tạo cuộc hẹn
    console.log("Submit appointment:", form);
    alert("Đã tạo cuộc hẹn mới!");
    setForm({ name: "", time: "", duration: "", status: "Pending" });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow space-y-4">
      <h1 className="text-2xl font-semibold text-center">Tạo Cuộc Hẹn Mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên khách</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thời gian</label>
          <input
            name="time"
            type="time"
            value={form.time}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Thời lượng (phút)
          </label>
          <input
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Tạo
          </button>
        </div>
      </form>
    </div>
  );
}
