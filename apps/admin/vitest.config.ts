import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@cinema/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@cinema/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
});
