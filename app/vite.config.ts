import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import { createHtmlPlugin } from 'vite-plugin-html'
import htmlMinifierTerser from 'vite-plugin-html-minifier-terser'
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      minify: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: "chatnio",
        name: "Chat Nio",
        short_name: "Chat Nio",
        description: "👋 Chat Nio, lightweight Web ChatGPT chat site",
        theme_color: "#0a0a0a",
        icons: [{
          src: "/logo.png",
          sizes: "64x64",
          type: "image/png",
        }],
        start_url: "/",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
      },
    },
  }
});
