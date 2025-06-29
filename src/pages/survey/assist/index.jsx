// src/pages/admin/AdminPage.jsx
import React, { useState, useEffect } from "react";
import api from "@/config/axios";
import Header from "@/components/header";
import { Link } from "react-router-dom";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Alert / Confirm state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/Admin/get-users");
      setUsers(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Select a user to view details
  const selectUser = async (userId) => {
    setError(null);
    try {
      const res = await api.get(`/Admin/get-user/${userId}`);
      setSelectedUser(res.data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Hide confirm
  const hideConfirm = () => setConfirmVisible(false);

  // Actions
  const handleDelete = (userId) => {
    setConfirmMessage("Bạn có chắc muốn xoá người dùng này?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/Admin/delete-user/${userId}`);
        setAlertMessage("Đã xóa người dùng.");
        setAlertVisible(true);
        setSelectedUser(null);
        fetchUsers();
      } catch (e) {
        setAlertMessage(`Xóa thất bại: ${e.message}`);
        setAlertVisible(true);
      }
    });
    setConfirmVisible(true);
  };

  const handleForceReset = (userId) => {
    setConfirmMessage("Xác nhận đặt lại mật khẩu?");
    setConfirmAction(() => async () => {
      try {
        await api.post(`/Admin/force-reset-password/${userId}`);
        setAlertMessage("Đã gửi yêu cầu reset mật khẩu.");
        setAlertVisible(true);
      } catch (e) {
        setAlertMessage(`Reset thất bại: ${e.message}`);
        setAlertVisible(true);
      }
    });
    setConfirmVisible(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User List */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Danh sách người dùng</h2>
          {loading ? (
            <p>Đang tải…</p>
          ) : error ? (
            <p className="text-red-500">Lỗi: {error}</p>
          ) : (
            <ul className="space-y-2">
              {users.map(u => (
                <li
                  key={u.id}
                  onClick={() => selectUser(u.id)}
                  className={`p-2 rounded cursor-pointer hover:bg-indigo-100 ${selectedUser?.id === u.id ? 'bg-indigo-50' : ''}`}
                >
                  {u.name} ({u.email})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User Details & Actions */}
        <div className="md:col-span-2 relative">
          {selectedUser ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-2">Chi tiết người dùng</h2>
              <p><strong>Tên:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Vai trò:</strong> {selectedUser.role}</p>

              <div className="mt-4 space-x-2">
                <button
                  onClick={() => handleDelete(selectedUser.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >Xóa người dùng</button>

                <button
                  onClick={() => handleForceReset(selectedUser.id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >Đặt lại mật khẩu</button>

                <Link
                  to={`/admin/assign-role/${selectedUser.id}`}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >Phân vai trò</Link>

                <Link
                  to={`/admin/update-user/${selectedUser.id}`}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >Cập nhật thông tin</Link>
              </div>
            </div>
          ) : (
            <p>Chọn người dùng để xem chi tiết</p>
          )}
        </div>
      </div>

      {/* Alert */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{alertMessage}</p>
            <button
              onClick={() => setAlertVisible(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >OK</button>
          </div>
        </div>
      )}

      {/* Confirm */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{confirmMessage}</p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={hideConfirm}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
              >Hủy</button>
              <button
                onClick={() => { confirmAction(); hideConfirm(); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
