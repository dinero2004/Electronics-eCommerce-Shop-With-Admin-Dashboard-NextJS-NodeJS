import { defineConfig, devices } from "@playwright/test";

const databaseUrl = process.env.DATABASE_URL || "mysql://my_first_shop_app:local-shop-dev-2026@127.0.0.1:3306/my_first_online_shop";
const authSecret = process.env.NEXTAUTH_SECRET || "local-development-secret-my-first-shop-2026-change-before-deploying";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm start",
      cwd: "./server",
      url: "http://127.0.0.1:3001/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        NEXTAUTH_URL: "http://127.0.0.1:3000",
        NEXTAUTH_SECRET: authSecret,
        FRONTEND_URL: "http://127.0.0.1:3000",
        PAYMENTS_MODE: "mock",
        ALLOW_MOCK_PAYMENTS: "true",
      },
    },
    {
      command: "npm run dev",
      cwd: ".",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        NEXTAUTH_URL: "http://127.0.0.1:3000",
        NEXTAUTH_SECRET: authSecret,
        NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:3001",
        INTERNAL_API_BASE_URL: "http://127.0.0.1:3001",
      },
    },
  ],
});
