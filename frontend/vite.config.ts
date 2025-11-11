import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173,
    fs: {
      allow: [".."], // Allow serving files from the parent directory (project root)
    },
    proxy: {
      "/uploads": {
        target: "http://localhost:8000", // Assuming your FastAPI backend runs on port 8000
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uploads/, "/uploads"),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
