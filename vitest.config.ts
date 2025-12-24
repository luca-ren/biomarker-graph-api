import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    sequence: { concurrent: false },
    fileParallelism: false,
    pool: 'threads',
    testTimeout: 20000,
    hookTimeout: 20000
  }
});
