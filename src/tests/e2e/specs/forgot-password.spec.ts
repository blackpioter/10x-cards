import { test, expect } from "@playwright/test";
import { ForgotPasswordPage } from "../pages/forgot-password.page";

test.describe("Forgot Password Page", () => {
  let forgotPasswordPage: ForgotPasswordPage;

  test.beforeEach(async ({ page }) => {
    forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();
  });

  test("should submit reset password request successfully", async () => {
    await forgotPasswordPage.requestPasswordReset(process.env.E2E_USERNAME as string);
    await forgotPasswordPage.expectSuccessfulSubmission();
  });

  test("should show validation error for empty email", async () => {
    await forgotPasswordPage.requestPasswordReset("");
    await forgotPasswordPage.expectValidationError("Please enter your email address");
  });

  test("should show validation error for invalid email format", async () => {
    await forgotPasswordPage.requestPasswordReset("invalid-email");
    await forgotPasswordPage.expectValidationError("Please enter your email address");
  });

  test("should navigate back to login page", async () => {
    await forgotPasswordPage.clickLoginLink();
  });

  test("should disable submit button while processing", async () => {
    await forgotPasswordPage.requestPasswordReset(process.env.E2E_USERNAME as string);
    await expect(await forgotPasswordPage.isSubmitButtonDisabled()).toBeTruthy();
  });

  test("should show success state after submission", async () => {
    await forgotPasswordPage.requestPasswordReset(process.env.E2E_USERNAME as string);
    await expect(await forgotPasswordPage.isSubmitted()).toBeTruthy();
  });
});
