import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environment for React components testing
    environment: 'jsdom',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        '**/*.config.{ts,js}',
        '**/dist/**',
        '**/build/**',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },

    // Setup files to run before tests
    setupFiles: ['./src/test/setup.ts'],

    // Global test settings
    globals: true,

    // Include patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
