import { defineConfig } from 'vitest/config';
import path from 'path';

// Standalone config (does not load the dev-only vite plugins) so contract
// tests can run in a plain Node environment with the `@` alias.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
});
