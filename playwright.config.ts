import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

const testDir = path.join(process.cwd(), "e2e");
const coverageDir = path.join(process.cwd(), "coverage");

export default defineConfig({
  testDir,
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    [
      "html",
      {
        outputFolder: path.join(coverageDir, "e2e-report"),
        open: "never",
      },
    ],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  outputDir: path.join(coverageDir, "screenshots"),
  snapshotDir: path.join(coverageDir, "screenshots"),
  webServer: {
    command: "npm run dev:e2e",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 30000,
  },
  projects: [
    {
      name: "cleanup db",
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        contextOptions: {
          ignoreHTTPSErrors: true,
        },
      },
      teardown: "cleanup db",
    },
  ],
});
