import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ForgotPasswordPage extends BasePage {
  // Selectors as getters
  private get container() {
    return this.getByTestId("forgot-password-container");
  }
  private get emailInput() {
    return this.getByTestId("forgot-password-email-input");
  }
  private get submitButton() {
    return this.getByTestId("forgot-password-submit-button");
  }
  private get loginLink() {
    return this.getByTestId("forgot-password-login-link");
  }
  private get header() {
    return this.getByTestId("forgot-password-header");
  }

  // Navigation
  async goto() {
    await this.page.goto("/forgot-password");
    await this.waitForElement("forgot-password-container");
  }

  // Actions
  async requestPasswordReset(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  async clickLoginLink() {
    await this.loginLink.click();
    await this.waitForUrl("/login");
  }

  // State checks
  async isErrorVisible() {
    const error = this.getByTestId("error-notification");
    return await error.isVisible();
  }

  async getErrorMessage() {
    const error = this.getByTestId("error-message");
    return await error.textContent();
  }

  async isSubmitButtonDisabled() {
    return await this.submitButton.isDisabled();
  }

  async isSubmitted() {
    const header = await this.page.getByText("Check your email");
    return await header.isVisible();
  }

  // Assertions
  async expectSuccessfulSubmission() {
    await expect(this.page.getByText("Check your email")).toBeVisible();
    await expect(this.page.getByText("We have sent a password reset link to your email address")).toBeVisible();
  }

  async expectValidationError(message: string) {
    await expect(this.getByTestId("error-message")).toContainText(message);
  }
}
