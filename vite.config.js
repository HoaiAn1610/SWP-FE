import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // '@' -> thư mục src
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      // Bất cứ request nào bắt đầu bằng /api sẽ được chuyển tới backend
      "/api": {
        target: "http://localhost:5165", // địa chỉ server ASP.NET / Express của bạn
        changeOrigin: true, // chỉnh host header thành target
        secure: false, // không kiểm tra SSL (nếu bạn dùng https self-signed)
      },
    },
  },
});
