// src/pages/admin/AdminPage.jsx
import React, { useState, useEffect } from "react";
import api from "@/config/axios";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Assign role state
  const [assigningUser, setAssigningUser] = useState(null);
  const [assignRoleValue, setAssignRoleValue] = useState("");

  // Alert / Confirm state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const roles = ["Member", "Staff", "Consultant", "Manager", "Admin"];

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  // Fetch users (all or by role)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = roleFilter
        ? `/Admin/get-users-by-role/${roleFilter}`
        : "/Admin/get-users";
      const res = await api.get(endpoint);
      setUsers(res.data);
    } catch (e) {
      showAlert(`Lỗi tải danh sách: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  // Delete user
  const handleDelete = (id) => {
    setConfirmMessage("Bạn có chắc muốn xóa người dùng này?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/Admin/delete-user/${id}`);
        showAlert("Xóa thành công");
        fetchUsers();
      } catch (e) {
        const msg = e.response?.data?.message || e.message;
        showAlert(`Xóa thất bại: ${msg}`);
      }
    });
    setConfirmVisible(true);
  };

  // Start assign role
  const startAssign = (id, currentRole) => {
    setAssigningUser(id);
    setAssignRoleValue(currentRole);
  };
  const confirmAssign = async () => {
    try {
      await api.post(`/Admin/assign-role/${assigningUser}`, assignRoleValue);
      showAlert("Thay đổi vai trò thành công");
      setAssigningUser(null);
      fetchUsers();
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      showAlert(`Thất bại: ${msg}`);
    }
  };

  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.role].some((f) =>
      f.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded px-4 py-2 focus:outline-none focus:ring"
          >
            <option value="">Tất cả vai trò</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Users Cards */}
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold">{u.name}</h3>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  <p className="mt-1">
                    <span className="font-medium">Vai trò:</span> {u.role}
                  </p>
                </div>
                <div className="mt-4 space-x-2 flex">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="flex-1 bg-red-500 text-white rounded px-3 py-2 hover:bg-red-600"
                  >
                    Xóa
                  </button>
                  {assigningUser === u.id ? (
                    <>
                      <select
                        value={assignRoleValue}
                        onChange={(e) => setAssignRoleValue(e.target.value)}
                        className="border rounded px-2 py-2"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={confirmAssign}
                        className="bg-green-500 text-white rounded px-3 py-2 hover:bg-green-600"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setAssigningUser(null)}
                        className="bg-gray-200 text-gray-700 rounded px-3 py-2 hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startAssign(u.id, u.role)}
                      className="flex-1 bg-indigo-500 text-white rounded px-3 py-2 hover:bg-indigo-600"
                    >
                      Phân vai trò
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      {alertVisible && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <p className="mb-4 font-medium text-indigo-700">{alertMessage}</p>
            <button
              onClick={() => setAlertVisible(false)}
              className="mt-2 bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmVisible && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <p className="mb-4 font-medium text-indigo-700">{confirmMessage}</p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={hideConfirm}
                className="bg-gray-200 text-gray-700 rounded px-4 py-2 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  confirmAction();
                  hideConfirm();
                }}
                className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
