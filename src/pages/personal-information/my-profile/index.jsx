// src/pages/personal-information/my-profile/MyProfilePage.jsx
import React, { useEffect, useState } from "react";
import api from "@/config/axios";

export default function MyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    id: 0,
    name: "",
    dob: "",
    phone: "",
    email: "",
    ageGroup: "",
    profileData: "",
  });

  // 1) Lấy user về
  useEffect(() => {
    api
      .get("/UserManagement/aboutMe")
      .then(({ data }) => {
        setUser(data);
        setForm({
          id: data.id,
          name: data.name || "",
          dob: data.dob || "",
          phone: data.phone || "",
          email: data.email || "",
          ageGroup: data.ageGroup || "",
          profileData: data.profileData || "",
        });
      })
      .catch(() => alert("Không tải được thông tin"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await api.put("/UserManagement/update-info", {
        Id: form.id,
        Name: form.name,
        Dob: form.dob,
        Phone: form.phone,
        Email: form.email,
        password: user.password,
        role: user.role, // Giữ nguyên role
        AgeGroup: form.ageGroup,
        ProfileData: form.profileData,
        emailVerified: user.emailVerified,
        createdDate: user.createdDate, // Giữ nguyên ngày tạo
      });
      // cập nhật lại user và tắt edit
      console.log("Cập nhật thành công", form);
      setUser({ ...user, ...form });
      setEditing(false);
      alert("Cập nhật thành công!");
    } catch {
      alert("Cập nhật thất bại");
      console.log("Cập nhật thành công", form);
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;
  if (!user) return <div className="p-8 text-red-500">User not found</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

      {!editing ? (
        // ----- VIEW MODE -----
        <div className="space-y-3">
          <div>
            <strong>Name:</strong> {user.name}
          </div>
          <div>
            <strong>DOB:</strong> {user.dob}
          </div>
          <div>
            <strong>Phone:</strong> {user.phone}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Age Group:</strong> {user.ageGroup}
          </div>
          <div>
            <strong>Profile Data:</strong> {user.profileData}
          </div>
          <div>
            <strong>Role:</strong> {user.role}
          </div>
          <div>
            <strong>Created:</strong>{" "}
            {new Date(user.createdDate).toLocaleString()}
          </div>

          <button
            onClick={() => setEditing(true)}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Edit
          </button>
        </div>
      ) : (
        // ----- EDIT MODE -----
        <div className="space-y-4">
          <div>
            <label className="block font-medium">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">DOB</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Age Group</label>
            <input
              name="ageGroup"
              value={form.ageGroup}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Profile Data</label>
            <textarea
              name="profileData"
              value={form.profileData}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
