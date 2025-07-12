// src/pages/personal-information/my-profile/MyProfilePage.jsx
import React, { useEffect, useState } from "react";
import api from "@/config/axios";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
} from "@mui/material";

export default function MyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [user, setUser] = useState(null);

  // form thông tin cá nhân
  const [form, setForm] = useState({
    id: 0,
    name: "",
    dob: "",
    phone: "",
    email: "",
    ageGroup: "",
    profileData: "",
  });

  // form đổi mật khẩu (self-change)
  const [passwordForm, setPasswordForm] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // form force-reset mật khẩu (admin)
  const [forceResetStep, setForceResetStep] = useState(0); // 0: nhập, 1: xác nhận
  const [forceResetForm, setForceResetForm] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  // state cho popup Alert / Confirm
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  // show alert
  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  // show confirm và lưu callback
  const showConfirm = (msg, action) => {
    setConfirmMessage(msg);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };

  // hide confirm popup
  const hideConfirm = () => {
    setConfirmVisible(false);
  };

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
        setPasswordForm((prev) => ({
          ...prev,
          email: data.email || "",
        }));
      })
      .catch(() => showAlert("Không tải được thông tin"))
      .finally(() => setLoading(false));
  }, []);

  // Xử lý thay đổi form profile
  const handleChangeProfile = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Gọi API lưu profile
  const handleSaveProfile = async () => {
    try {
      await api.put("/UserManagement/update-info", {
        Id: form.id,
        Name: form.name,
        Dob: form.dob,
        Phone: form.phone,
        Email: form.email,
        password: user.password,
        role: user.role,
        AgeGroup: form.ageGroup,
        ProfileData: form.profileData,
        emailVerified: user.emailVerified,
        createdDate: user.createdDate,
      });
      setUser({ ...user, ...form });
      setEditingProfile(false);
      showAlert("Cập nhật thông tin thành công!");
    } catch {
      showAlert("Cập nhật thông tin thất bại");
    }
  };

  // Xử lý thay đổi form mật khẩu self-change
  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    setPasswordForm((f) => ({ ...f, [name]: value }));
  };

  // Thực sự gọi API đổi mật khẩu self-change
  const doChangePassword = async () => {
    try {
      const { email, oldPassword, newPassword, confirmNewPassword } =
        passwordForm;
      await api.post("/Auth/change-password", {
        Email: email,
        OldPassword: oldPassword,
        NewPassword: newPassword,
        ConfirmNewPassword: confirmNewPassword,
      });
      setEditingPassword(false);
      setPasswordForm((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
      showAlert("Đổi mật khẩu thành công!");
    } catch (err) {
      const msg = err.response?.data || "Đổi mật khẩu thất bại";
      showAlert(`Lỗi: ${msg}`);
    }
  };

  // Xử lý thay đổi form force-reset
  const handleForceResetChange = (e) => {
    const { name, value } = e.target;
    setForceResetForm((f) => ({ ...f, [name]: value }));
  };

  // Chuyển bước force-reset
  const handleForceResetNext = () => {
    const { newPassword, confirmNewPassword } = forceResetForm;
    if (!newPassword) {
      showAlert("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert("Mật khẩu xác nhận không khớp");
      return;
    }
    setForceResetStep(1);
  };

  // Thực sự gọi API force-reset mật khẩu và ẩn ngay khi thành công
  const doForceReset = async () => {
    try {
      await api.post(`/Admin/force-reset-password/${user.id}`, {
        NewPassword: forceResetForm.newPassword,
      });
      // Cập nhật user.password để panel force-reset biến mất
      setUser((prev) => ({
        ...prev,
        password: forceResetForm.newPassword,
      }));
      // reset form
      setForceResetStep(0);
      setForceResetForm({ newPassword: "", confirmNewPassword: "" });
      showAlert("Force-reset mật khẩu thành công!");
    } catch (err) {
      const msg = err.response?.data || "Force-reset thất bại";
      showAlert(`Lỗi: ${msg}`);
    }
  };

  if (loading)
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="h6">Đang tải…</Typography>
      </Container>
    );
  if (!user)
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 8 }}>
        <Typography color="error">Không tìm thấy người dùng</Typography>
      </Container>
    );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card elevation={3} sx={{ maxWidth: 800, mx: "auto" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Hồ sơ của tôi
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* --- CHẾ ĐỘ XEM --- */}
          {!editingProfile && !editingPassword && (
            <Box>
              {[
                "Tên",
                "Ngày sinh",
                "Số điện thoại",
                "Email",
                "Nhóm tuổi",
                "Thông tin hồ sơ",
                "Vai trò",
              ].map((label, idx) => {
                const key = [
                  "name",
                  "dob",
                  "phone",
                  "email",
                  "ageGroup",
                  "profileData",
                  "role",
                ][idx];
                const value = key === "role" ? user.role : user[key];
                return (
                  <Box key={key} sx={{ display: "flex", mb: 1.5 }}>
                    <Typography sx={{ width: "30%", fontWeight: "bold" }}>
                      {label}:
                    </Typography>
                    <Typography sx={{ width: "70%", textAlign: "center" }}>
                      {key === "dob" ? user.dob : value}
                    </Typography>
                  </Box>
                );
              })}
              <Box sx={{ display: "flex", mb: 1.5 }}>
                <Typography sx={{ width: "30%", fontWeight: "bold" }}>
                  Ngày tạo:
                </Typography>
                <Typography sx={{ width: "70%", textAlign: "center" }}>
                  {new Date(user.createdDate).toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ textAlign: "right", mt: 2 }}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setEditingProfile(true)}
                  sx={{ mr: 1 }}
                >
                  Chỉnh sửa thông tin
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setEditingPassword(true)}
                >
                  Đổi mật khẩu
                </Button>
              </Box>

              {/* --- HIỂN THỊ FORCE-RESET KHI MẬT KHẨU NULL --- */}
              {(user.password == null || user.password === "null") && (
                <Box
                  component="form"
                  noValidate
                  autoComplete="off"
                  sx={{ mt: 4, "& .MuiTextField-root": { my: 1 } }}
                >
                  <Typography variant="h6" sx={{ color: "red", mb: 1 }}>
                    Nếu đăng nhập bằng Google lần đầu thì đặt mật khẩu bằng cái
                    này
                  </Typography>

                  {forceResetStep === 0 ? (
                    <>
                      <TextField
                        fullWidth
                        label="Mật khẩu mới"
                        name="newPassword"
                        type="password"
                        value={forceResetForm.newPassword}
                        onChange={handleForceResetChange}
                      />
                      <TextField
                        fullWidth
                        label="Xác nhận mật khẩu mới"
                        name="confirmNewPassword"
                        type="password"
                        value={forceResetForm.confirmNewPassword}
                        onChange={handleForceResetChange}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 1,
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={handleForceResetNext}
                        >
                          Tiếp
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Mật khẩu mới đã tạo
                      </Typography>
                      <TextField
                        fullWidth
                        label="Mật khẩu mới"
                        value={forceResetForm.newPassword}
                        disabled
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 1,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="error"
                          onClick={doForceReset}
                        >
                          Reset mật khẩu
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* --- CHẾ ĐỘ CHỈNH SỬA PROFILE --- */}
          {editingProfile && (
            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{ "& .MuiTextField-root": { my: 1 } }}
            >
              <TextField
                fullWidth
                label="Tên"
                name="name"
                value={form.name}
                onChange={handleChangeProfile}
              />
              <TextField
                fullWidth
                label="Ngày sinh"
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChangeProfile}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phone"
                value={form.phone}
                onChange={handleChangeProfile}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChangeProfile}
              />
              <TextField
                fullWidth
                label="Nhóm tuổi"
                name="ageGroup"
                value={form.ageGroup}
                onChange={handleChangeProfile}
              />
              <TextField
                fullWidth
                label="Thông tin hồ sơ"
                name="profileData"
                value={form.profileData}
                onChange={handleChangeProfile}
                multiline
                rows={3}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setEditingProfile(false)}
                  sx={{ mr: 1 }}
                >
                  Hủy
                </Button>
                <Button variant="contained" onClick={handleSaveProfile}>
                  Lưu
                </Button>
              </Box>
            </Box>
          )}

          {/* --- CHẾ ĐỔI MẬT KHẨU SELF-CHANGE --- */}
          {editingPassword && (
            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{ "& .MuiTextField-root": { my: 1 } }}
            >
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={passwordForm.email}
                disabled
              />
              <TextField
                fullWidth
                label="Mật khẩu cũ"
                name="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={handleChangePassword}
              />
              <TextField
                fullWidth
                label="Mật khẩu mới"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handleChangePassword}
              />
              <TextField
                fullWidth
                label="Xác nhận mật khẩu mới"
                name="confirmNewPassword"
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={handleChangePassword}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setEditingPassword(false)}
                  sx={{ mr: 1 }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    showConfirm(
                      "Bạn có chắc muốn đổi mật khẩu không?",
                      doChangePassword
                    )
                  }
                >
                  Đổi mật khẩu
                </Button>
              </Box>
            </Box>
          )}

          {/* Alert Popup */}
          {alertVisible && (
            <div className="fixed inset-0 flex items-center justify-center z-60 bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
                <p className="mb-4 text-indigo-800 font-semibold">
                  {alertMessage}
                </p>
                <button
                  onClick={() => setAlertVisible(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* Confirm Popup */}
          {confirmVisible && (
            <div className="fixed inset-0 flex items-center justify-center z-60 bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
                <p className="mb-4 text-indigo-800 font-semibold">
                  {confirmMessage}
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={hideConfirm}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      confirmAction();
                      hideConfirm();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
