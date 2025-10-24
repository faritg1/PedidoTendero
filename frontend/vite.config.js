import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configura el proxy al backend
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000"
    }
  }
});
