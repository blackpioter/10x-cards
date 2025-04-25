import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Ensure we load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Validate required env variables
const requiredEnvVars = ["E2E_USERNAME", "E2E_PASSWORD"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is missing`);
  }
});

export default defineConfig({
  testDir: "./src/tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Timeout settings
  timeout: 30000, // Global timeout
  expect: {
    timeout: 5000, // Timeout for expect assertions
  },

  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "./coverage/e2e-report",
        open: "never",
      },
    ],
  ],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Browser settings
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Auth state handling
        storageState: process.env.AUTH_STATE_PATH,
      },
    },
  ],

  // Global setup to handle authentication state
  globalSetup: "./src/tests/e2e/global-setup.ts",

  // Output test results
  outputDir: "test-results",
});
