import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      // Local proxy so cricket scores work without CORS issues
      "/api/cricket": {
        target: "https://www.cricbuzz.com",
        changeOrigin: true,
        secure: false,
        rewrite: () => "/api/home",
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Accept", "application/json");
            proxyReq.setHeader(
              "User-Agent",
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            );
            proxyReq.setHeader("Referer", "https://www.cricbuzz.com/");
          });
          proxy.on("proxyRes", (proxyRes) => {
            proxyRes.headers["access-control-allow-origin"] = "*";
            proxyRes.headers["cache-control"] = "public, max-age=60";
          });
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Vendor code changes rarely; separate chunks stay cached across app deploys.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          motion: ["framer-motion"]
        }
      }
    }
  },
  preview: {
    port: 4173,
    host: "0.0.0.0"
  }
});
