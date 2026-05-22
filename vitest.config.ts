import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    testTimeout: 30000,
    pool: 'forks',
    maxWorkers: 2,
    fileParallelism: false,
  },
});
