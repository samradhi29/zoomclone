import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/socket.io": {
        target:  "https://zoomclone-15445456.onrender.com",
        ws: true,
        changeOrigin: true
      }
    },
    // Add these lines
    headers: {
      'Content-Type': 'application/javascript'
    }
  }
});