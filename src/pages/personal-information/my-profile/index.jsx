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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function MyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
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

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

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
      .catch(() => showAlert("Không tải được thông tin"))
      .finally(() => setLoading(false));
  }, []);

  const handleChangeProfile = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

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

          {/* === CHẾ ĐỘ XEM === */}
          {!editingProfile && (
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
              </Box>
            </Box>
          )}

          {/* === CHẾ ĐỘ CHỈNH SỬA THÔNG TIN === */}
          {editingProfile && (
            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{
                "& .MuiTextField-root": { my: 1 },
                "& .MuiFormControl-root": { my: 1 },
              }}
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
              <FormControl fullWidth>
                <InputLabel id="ageGroup-label">Nhóm tuổi</InputLabel>
                <Select
                  labelId="ageGroup-label"
                  id="ageGroup"
                  name="ageGroup"
                  value={form.ageGroup}
                  label="Nhóm tuổi"
                  onChange={handleChangeProfile}
                >
                  <MenuItem value="">
                    <em>-- Chọn nhóm tuổi --</em>
                  </MenuItem>
                  <MenuItem value="Học sinh">Học sinh</MenuItem>
                  <MenuItem value="Sinh viên">Sinh viên</MenuItem>
                  <MenuItem value="Phụ huynh">Phụ huynh</MenuItem>
                  <MenuItem value="Giáo viên">Giáo viên</MenuItem>
                </Select>
              </FormControl>
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

          {/* === ALERT POPUP === */}
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
        </CardContent>
      </Card>
    </Container>
  );
}
