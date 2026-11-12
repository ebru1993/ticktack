import { defineConfig, devices } from '@playwright/test'

const port = 4181

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    ...devices['iPad (gen 7) landscape'],
    hasTouch: true,
    browserName: 'webkit',
    locale: 'de-CH',
  },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
    port,
    reuseExistingServer: !process.env.CI,
  },
})
