import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 5 — cấu hình tối giản như bản gốc.
export default defineConfig({
  plugins: [react()],
  server: {
    // Backend Express chạy :4000 (CORS đã bật credentials).
    // Nếu muốn dev qua proxy thay vì gọi thẳng, bỏ comment:
    proxy: {
      "/auth": "http://localhost:4000",
      "/todos": "http://localhost:4000",
      "/api": "http://localhost:4000",
    },
  },
});
