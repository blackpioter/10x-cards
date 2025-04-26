import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";

test.describe("Error Notification Component", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should show different error titles based on error type", async () => {
    // Validation error
    await loginPage.login("", "");
    await expect(loginPage.errorNotification).toContainText("Validation Error");

    // API error (need to mock API response)
    await loginPage.login("test@example.com", "wrongpass");
    await expect(loginPage.errorNotification).toContainText("API Error");
  });

  test("should auto-dismiss error after 5 seconds", async () => {
    await loginPage.login("", "");
    await expect(loginPage.errorNotification).toBeVisible();
    await expect(loginPage.errorNotification).toBeHidden({ timeout: 5500 });
  });

  test("should allow manual dismissal", async () => {
    await loginPage.login("", "");
    await expect(loginPage.errorNotification).toBeVisible();
    await loginPage.closeErrorNotification();
    await expect(loginPage.errorNotification).toBeHidden();
  });
});
