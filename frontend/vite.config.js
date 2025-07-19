import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Optional: customize the dev port
    open: true, // Optional: opens browser on dev start
  },
});
