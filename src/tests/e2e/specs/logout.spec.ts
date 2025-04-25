import { test, expect } from "@playwright/test";
import { LogoutPage } from "../pages/logout.page";
import { LoginPage } from "../pages/login.page";

test.describe("Logout Page", () => {
  let logoutPage: LogoutPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Setup: Login first
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.E2E_USERNAME as string, process.env.E2E_PASSWORD as string);
    await loginPage.expectSuccessfulLogin();

    // Initialize logout page
    logoutPage = new LogoutPage(page);
  });

  test("should logout successfully", async () => {
    await logoutPage.goto();
    await expect(await logoutPage.isLoading()).toBeTruthy();
    await logoutPage.expectSuccessfulLogout();
  });

  test("should show loading state", async () => {
    await logoutPage.goto();
    await expect(await logoutPage.isLoading()).toBeTruthy();
  });

  test("should redirect to login page after successful logout", async () => {
    await logoutPage.goto();
    await logoutPage.waitForRedirect();
  });

  test("should show success message before redirect", async () => {
    await logoutPage.goto();
    await expect(await logoutPage.isSuccessMessageVisible()).toBeTruthy();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Simulate network error
    await page.route("/api/auth/logout", (route) => route.abort());

    await logoutPage.goto();
    await logoutPage.expectError("Failed to logout");
  });
});
