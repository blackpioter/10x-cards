import { chromium } from "@playwright/test";
import { LoginPage } from "./pages/login.page";

async function globalSetup() {
  // Skip auth setup if AUTH_STATE_PATH is not set
  if (!process.env.AUTH_STATE_PATH) {
    console.log("Skipping auth setup - AUTH_STATE_PATH not set");
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.E2E_USERNAME as string, process.env.E2E_PASSWORD as string);
    await loginPage.expectSuccessfulLogin();

    // Save signed-in state to 'storageState.json'
    await page.context().storageState({ path: process.env.AUTH_STATE_PATH });

    console.log("Auth state saved successfully");
  } catch (error) {
    console.error("Failed to save auth state:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export { globalSetup as default };
