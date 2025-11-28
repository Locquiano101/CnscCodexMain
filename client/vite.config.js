import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // expose to network
    // Use a non-default port to avoid conflicts with other projects
    port: Number(process.env.VITE_PORT) || 5174,
    strictPort: true, // fail instead of auto-selecting a different port
  },
});
