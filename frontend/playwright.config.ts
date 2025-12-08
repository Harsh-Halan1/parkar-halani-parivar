import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  webServer: [
    {
      command: 'npm run dev',
      port: 3000,
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: false,
  retries: 1,
  workers: 1,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
