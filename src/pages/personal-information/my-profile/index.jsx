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

  // 1) Lấy thông tin user
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

  // Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Lưu thông tin đã chỉnh sửa
  const handleSave = async () => {
    try {
      await api.put("/UserManagement/update-info", {
        Id: form.id,
        Name: form.name,
        Dob: form.dob,
        Phone: form.phone,
        Email: form.email,
        password: user.password,
        role: user.role, // Giữ nguyên vai trò
        AgeGroup: form.ageGroup,
        ProfileData: form.profileData,
        emailVerified: user.emailVerified,
        createdDate: user.createdDate, // Giữ nguyên ngày tạo
      });
      console.log("Cập nhật thành công", form);
      setUser({ ...user, ...form });
      setEditing(false);
      alert("Cập nhật thành công!");
    } catch {
      alert("Cập nhật thất bại");
      console.log("Cập nhật thất bại", form);
    }
  };

  if (loading) return <div className="p-8">Đang tải…</div>;
  if (!user)
    return <div className="p-8 text-red-500">Không tìm thấy người dùng</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Hồ sơ của tôi</h1>

      {!editing ? (
        // ----- CHẾ ĐỘ XEM -----
        <div className="space-y-3">
          <div>
            <strong>Tên:</strong> {user.name}
          </div>
          <div>
            <strong>Ngày sinh:</strong> {user.dob}
          </div>
          <div>
            <strong>Số điện thoại:</strong> {user.phone}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Nhóm tuổi:</strong> {user.ageGroup}
          </div>
          <div>
            <strong>Thông tin hồ sơ:</strong> {user.profileData}
          </div>
          <div>
            <strong>Vai trò:</strong> {user.role}
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(user.createdDate).toLocaleString()}
          </div>

          <button
            onClick={() => setEditing(true)}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Chỉnh sửa
          </button>
        </div>
      ) : (
        // ----- CHẾ ĐỘ CHỈNH SỬA -----
        <div className="space-y-4">
          <div>
            <label className="block font-medium">Tên</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Ngày sinh</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Số điện thoại</label>
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
            <label className="block font-medium">Nhóm tuổi</label>
            <input
              name="ageGroup"
              value={form.ageGroup}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Thông tin hồ sơ</label>
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
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Lưu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
