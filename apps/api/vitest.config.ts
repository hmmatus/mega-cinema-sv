import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: './src',
    environment: 'node',
    coverage: {
      provider: 'v8',
      reportsDirectory: '../coverage',
      include: ['**/*.ts'],
      exclude: ['**/*.module.ts', '**/main.ts'],
    },
  },
  resolve: {
    alias: {
      '@cinema/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@cinema/database': resolve(__dirname, '../../packages/database/src/index.ts'),
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
