import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Supabase config — env vars are injected by Lovable Cloud in production.
  // Fallbacks kept for local development only.
  const supabaseUrl = env.VITE_SUPABASE_URL || 'https://afvssugntxjolqqeyffn.supabase.co';
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmdnNzdWdudHhqb2xxcWV5ZmZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzkzNjIsImV4cCI6MjA4NTIxNTM2Mn0.-OMupENyeT43nrybPSB9EtS7KBVYP4XYlhZgGZuebkM';

  return {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseKey),
    },
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt", "nearvity-logo.png"],
        manifest: {
          name: "NEARVITY - Le premier réseau social 100% réel",
          short_name: "NEARVITY",
          description: "Facilite les rencontres IRL. Des vraies personnes, prêtes à se retrouver.",
          theme_color: "#0f0f1a",
          background_color: "#0f0f1a",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          categories: ["social", "lifestyle"],
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
      }),
    ].filter(Boolean),
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-tooltip'],
            'vendor-query': ['@tanstack/react-query', 'zustand'],
            'vendor-mapbox': ['mapbox-gl', 'supercluster'],
            'vendor-charts': ['recharts'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
