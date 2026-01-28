import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@config': path.resolve(__dirname, './src/config'),
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  base: '/wordwalker/dist/', // Use subdirectory path for deployment with dist folder
  publicDir: 'public', // Ensure public directory is copied to dist
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
          }
          
          // Question categories - each gets its own chunk
          if (id.includes('src/config/questions/')) {
            if (id.includes('food.js')) return 'q-food';
            if (id.includes('shopping.js')) return 'q-shopping';
            if (id.includes('entertainment.js')) return 'q-entertainment';
            if (id.includes('accommodation.js')) return 'q-accommodation';
            if (id.includes('transportation.js')) return 'q-transportation';
            if (id.includes('directions.js')) return 'q-directions';
            if (id.includes('medical.js')) return 'q-medical';
            if (id.includes('greetings.js')) return 'q-greetings';
            if (id.includes('numbers.js')) return 'q-numbers';
            if (id.includes('grammar.js')) return 'q-grammar';
            if (id.includes('recreation.js')) return 'q-recreation';
            if (id.includes('plants_animals.js')) return 'q-plants-animals';
            if (id.includes('people.js')) return 'q-people';
            if (id.includes('daily_routines.js')) return 'q-daily-routines';
            if (id.includes('business.js')) return 'q-business';
            if (id.includes('environment.js')) return 'q-environment';
            if (id.includes('categories.js')) return 'q-categories';
          }
          
          // Translations - separate chunks
          if (id.includes('src/config/translations/')) {
            if (id.includes('answer_translations.js')) return 'translations-answers';
            if (id.includes('example_translations.js')) return 'translations-examples';
          }
        },
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]--[hash:base64:5]',
    },
  },
});
