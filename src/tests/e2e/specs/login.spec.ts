import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

test.describe("Login Page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should login successfully with valid credentials", async () => {
    await loginPage.login(process.env.E2E_USERNAME as string, process.env.E2E_PASSWORD as string);
    await loginPage.expectSuccessfulLogin();
  });

  test("should show validation error for empty form submission", async () => {
    await loginPage.login("", "");
    await loginPage.expectValidationError("Please fill in all fields");
  });

  test("should show error for invalid credentials", async () => {
    await loginPage.login(process.env.E2E_USERNAME as string, "wrong-password");
    await loginPage.expectValidationError("Failed to sign in");
  });

  test("should navigate to forgot password page", async () => {
    await loginPage.clickForgotPassword();
  });

  test("should disable submit button while loading", async () => {
    await loginPage.login(process.env.E2E_USERNAME as string, process.env.E2E_PASSWORD as string);
    await expect(await loginPage.isSubmitButtonDisabled()).toBeTruthy();
  });
});
