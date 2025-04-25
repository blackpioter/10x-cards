import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  // Selectors as getters
  private get container() {
    return this.getByTestId("login-form-container");
  }
  private get emailInput() {
    return this.getByTestId("login-email-input");
  }
  private get passwordInput() {
    return this.getByTestId("login-password-input");
  }
  private get submitButton() {
    return this.getByTestId("login-submit-button");
  }
  private get errorMessage() {
    return this.getByTestId("login-error-message");
  }
  private get forgotPasswordLink() {
    return this.getByTestId("login-forgot-password-link");
  }

  // Navigation
  async goto() {
    await this.page.goto("/login");
    await this.waitForElement("login-form-container");
  }

  // Actions
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.waitForUrl("/forgot-password");
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

  // Assertions
  async expectSuccessfulLogin() {
    await this.waitForUrl("/generate");
  }

  async expectValidationError(message: string) {
    await expect(this.getByTestId("error-message")).toContainText(message);
  }
}
