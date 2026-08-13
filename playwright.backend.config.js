import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e-backend',
  workers: 1,
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'npm run build -- --mode test && npm run preview -- --host localhost --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
