import api from "../config/axios";

/**
 * Lấy thông tin user theo id
 * @param {number} userId – ID của user cần fetch
 * @returns {Promise<{id: number, name: string, ...}>>} – Thông tin user
 */
export const fetchUserById = async (userId) => {
  const { data } = await api.get(`/Admin/get-user/${userId}`);
  return data;
};