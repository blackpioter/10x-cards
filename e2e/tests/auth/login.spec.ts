import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";

// Get test credentials from environment variables
const E2E_USERNAME = process.env.E2E_USERNAME ?? "test@example.com";
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "password123";

test.describe("Login Form", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("networkidle");
  });

  test("should display empty login form initially", async () => {
    // Wait for and verify form container
    await expect(loginPage.formContainer).toBeVisible();

    // Check form elements
    await expect(loginPage.emailInput).toBeEmpty();
    await expect(loginPage.emailInput).toHaveAttribute("placeholder", "name@example.com");
    await expect(loginPage.emailInput).toHaveAttribute("type", "email");

    await expect(loginPage.passwordInput).toBeEmpty();
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");

    await expect(loginPage.submitButton).toBeDisabled();
  });

  test("should enable submit button when form is valid", async () => {
    await loginPage.emailInput.fill(E2E_USERNAME);
    await loginPage.passwordInput.fill(E2E_PASSWORD);
    await expect(loginPage.submitButton).toBeEnabled();
  });

  test("should show validation error for empty fields", async () => {
    await loginPage.emailInput.fill(E2E_USERNAME);
    await loginPage.submitButton.click();
    await expect(loginPage.errorNotification).toContainText("Please fill in all fields");

    // Error should auto-dismiss after 5 seconds
    await expect(loginPage.errorNotification).toBeHidden({ timeout: 5500 });
  });

  test("should show loading state during authentication", async () => {
    await loginPage.emailInput.fill(E2E_USERNAME);
    await loginPage.passwordInput.fill(E2E_PASSWORD);
    await loginPage.submitButton.click();

    await expect(loginPage.submitButton).toHaveText("Signing in...");
    await expect(loginPage.emailInput).toBeDisabled();
    await expect(loginPage.passwordInput).toBeDisabled();
  });

  test("should redirect to /generate on successful login", async () => {
    await loginPage.login(E2E_USERNAME, E2E_PASSWORD);
    await expect(loginPage.page).toHaveURL("/generate");
  });

  test("should show API error notification on failed login", async () => {
    await loginPage.login("invalid@example.com", "wrongpassword");
    await expect(loginPage.errorNotification).toBeVisible();

    // Manually close error notification
    await loginPage.closeErrorNotification();
    await expect(loginPage.errorNotification).toBeHidden();
  });

  test("should navigate to forgot password page", async () => {
    await loginPage.navigateToForgotPassword();
    await expect(loginPage.page).toHaveURL("/forgot-password");
  });

  test("should navigate to register page", async () => {
    await loginPage.navigateToRegister();
    await expect(loginPage.page).toHaveURL("/register");
  });

  test("should handle network errors", async () => {
    // Simulate offline state
    await loginPage.page.route("/api/auth/login", (route) => route.abort("failed"));

    // Create a promise that resolves when the route is called
    const waitForRequest = loginPage.page.waitForRequest("/api/auth/login");

    await loginPage.login(E2E_USERNAME, E2E_PASSWORD);

    // Wait for the request to be made and aborted
    await waitForRequest.catch((error) => {
      // Expected error from aborted request
      if (!(error instanceof Error) || !error.message.includes("aborted")) {
        throw error;
      }
    });

    // Wait for error notification and verify error type and message
    await expect(loginPage.errorNotification).toBeVisible({ timeout: 3000 });
    await expect(loginPage.errorNotification).toContainText("Failed to sign in");

    // Verify form is re-enabled after error
    await expect(loginPage.emailInput).toBeEnabled();
    await expect(loginPage.passwordInput).toBeEnabled();
    await expect(loginPage.submitButton).toBeEnabled();
  });

  test("should validate email format", async () => {
    await loginPage.emailInput.fill("invalid-email");
    await loginPage.passwordInput.fill(E2E_PASSWORD);
    await loginPage.submitButton.click();

    // Browser's native email validation should prevent submission
    await expect(loginPage.page).toHaveURL("/login");
  });
});
