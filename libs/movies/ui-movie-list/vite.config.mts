/// <reference types='vitest' />
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/movies/ui-movie-list',
  // explicit tsconfig: Nx loads this config outside test mode too (project graph in CI)
  plugins: [
    angular({ tsconfig: resolve(import.meta.dirname, 'tsconfig.spec.json') }),
  ],
  resolve: { tsconfigPaths: true },
  test: {
    name: 'movies-ui-movie-list',
    watch: false,
    passWithNoTests: true,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/movies/ui-movie-list',
      provider: 'v8' as const,
    },
  },
}));
