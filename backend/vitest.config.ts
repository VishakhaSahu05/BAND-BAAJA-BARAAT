import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    pool: 'threads',
    maxWorkers: 1,
    // config/env.ts validates process.env at import time; give tests a fixed, DB-less environment.
    env: {
      NODE_ENV: 'test',
      PORT: '3000',
    },
    // Integration suites boot an in-memory MongoDB replica set and hash passwords with bcrypt.
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
