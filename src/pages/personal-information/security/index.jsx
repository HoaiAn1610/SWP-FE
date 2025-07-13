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
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Self-change password
  const [passwordForm, setPasswordForm] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Force-reset password
  const [forceResetStep, setForceResetStep] = useState(0);
  const [forceResetForm, setForceResetForm] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showForceNewPassword, setShowForceNewPassword] = useState(false);
  const [showForceConfirmNewPassword, setShowForceConfirmNewPassword] =
    useState(false);

  // Alert & Confirm
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };
  const showConfirm = (msg, action) => {
    setConfirmMessage(msg);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  useEffect(() => {
    api
      .get("/UserManagement/aboutMe")
      .then(({ data }) => {
        setUser(data);
        setPasswordForm((prev) => ({
          ...prev,
          email: data.email || "",
        }));
      })
      .catch(() => showAlert("Không tải được thông tin"))
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    setPasswordForm((f) => ({ ...f, [name]: value }));
  };

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

  const handleForceResetChange = (e) => {
    const { name, value } = e.target;
    setForceResetForm((f) => ({ ...f, [name]: value }));
  };

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

  const doForceReset = async () => {
    try {
      await api.post(`/Admin/force-reset-password/${user.id}`, {
        NewPassword: forceResetForm.newPassword,
      });
      setUser((prev) => ({
        ...prev,
        password: forceResetForm.newPassword,
      }));
      setForceResetStep(0);
      setForceResetForm({ newPassword: "", confirmNewPassword: "" });
      setShowForceNewPassword(false);
      setShowForceConfirmNewPassword(false);
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

  const needsForceReset = user.password == null || user.password === "null";

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card elevation={3} sx={{ maxWidth: 800, mx: "auto" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Bảo mật
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {!needsForceReset && (
            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{ "& .MuiTextField-root": { my: 1 } }}
            >
              <Typography variant="h6">Đổi mật khẩu</Typography>
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
                type={showOldPassword ? "text" : "password"}
                value={passwordForm.oldPassword}
                onChange={handleChangePassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        edge="end"
                      >
                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Mật khẩu mới"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={handleChangePassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Xác nhận mật khẩu mới"
                name="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmNewPassword}
                onChange={handleChangePassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
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

          {needsForceReset && (
            <Box sx={{ mt: 4, "& .MuiTextField-root": { my: 1 } }}>
              <Typography variant="h6">Đặt Mật Khẩu</Typography>
              {forceResetStep === 0 ? (
                <>
                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    name="newPassword"
                    type={showForceNewPassword ? "text" : "password"}
                    value={forceResetForm.newPassword}
                    onChange={handleForceResetChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowForceNewPassword(!showForceNewPassword)
                            }
                            edge="end"
                          >
                            {showForceNewPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    name="confirmNewPassword"
                    type={showForceConfirmNewPassword ? "text" : "password"}
                    value={forceResetForm.confirmNewPassword}
                    onChange={handleForceResetChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowForceConfirmNewPassword(
                                !showForceConfirmNewPassword
                              )
                            }
                            edge="end"
                          >
                            {showForceConfirmNewPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                  >
                    <Button variant="contained" onClick={handleForceResetNext}>
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
                    type={showForceNewPassword ? "text" : "password"}
                    value={forceResetForm.newPassword}
                    disabled
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowForceNewPassword(!showForceNewPassword)
                            }
                            edge="end"
                          >
                            {showForceNewPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 1,
                      gap: 1,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setForceResetStep(0);
                        setShowForceNewPassword(false);
                        setShowForceConfirmNewPassword(false);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={doForceReset}
                    >
                      Tạo mật khẩu
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          )}

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
