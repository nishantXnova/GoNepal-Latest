import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages deployment base
  base: '/',
  
  server: {
    host: true,
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  
  plugins: [
    react(),
    // PWA Configuration for offline-first trekking app
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'gonepallogo.png',
        'placeholder.svg',
        'robots.txt',
        'site.webmanifest',
        'manifest.json',
        'logos/buddha-air.svg',
        'logos/tara-air.png',
        'logos/yeti-airlines.svg',
      ],
      manifest: {
        name: 'GoNepal - Trekking Companion',
        short_name: 'GoNepal',
        id: 'gonepal.app',
        description: 'Your offline companion for high-altitude Nepal trekking - Explore Everest, temples, wildlife, and culture',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        dir: 'ltr',
        categories: ['travel', 'lifestyle', 'sports'],
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'gonepallogo.png',
            sizes: '96x96 128x128 192x192 512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        shortcuts: [
          {
            name: 'Explore Destinations',
            short_name: 'Explore',
            description: 'Browse amazing destinations in Nepal',
            url: '/?shortcut=destinations',
            icons: [{ src: '/gonepallogo.png', sizes: '96x96' }],
          },
          {
            name: 'Book Flights',
            short_name: 'Flights',
            description: 'Book domestic flights in Nepal',
            url: '/?shortcut=flights',
            icons: [{ src: '/gonepallogo.png', sizes: '96x96' }],
          },
        ],
        share_target: {
          action: '/share',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
          },
        },
      },
      // PWABuilder requires proper service worker configuration
      devOptions: {
        enabled: false,
        navigateFallback: '/',
        type: 'module',
      },
      workbox: {
        // Aggressive caching strategies for offline use
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: [
          '**/node_modules/**/*',
          '**/repo/**/*',
          '**/test/**/*',
        ],
        // Runtime caching for map tiles
        runtimeCaching: [
          {
            // OpenStreetMap tiles - CacheFirst strategy
            urlPattern: ({ url }) => 
              url.hostname.includes('tile.openstreetmap.org') ||
              url.hostname.includes('tile.thunderforest.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'gonepal-map-tiles',
              expiration: {
                maxEntries: 10000,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // API requests - NetworkFirst with cache fallback
            urlPattern: ({ url }) =>
              url.pathname.includes('/api/') ||
              url.hostname.includes('supabase.co') ||
              url.hostname.includes('rss2json.com'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gonepal-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Images - CacheFirst
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'gonepal-images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Static assets - StaleWhileRevalidate
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'gonepal-static-assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Fonts - CacheFirst with long cache
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'gonepal-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Skip waiting to activate immediately
        skipWaiting: true,
        // Don't claim clients automatically - controlled by message
        clientsClaim: false,
      },
    }),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    target: 'esnext',
    minify: 'esbuild',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Generate sourcemaps for production debugging (disabled for speed)
    sourcemap: false,
    // Optimize for mobile - smaller chunks
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-slot',
          ],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
          'vendor-offline': ['dexie', 'localforage', 'leaflet.offline'],
        },
      },
    },
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
  
  // Prefetch strategy for faster subsequent loads
  prefetchStrategy: 'viewport',
}));
