import { Page } from "@playwright/test";

export class LoginPage {
  constructor(public readonly page: Page) {}

  // Locators
  readonly url = "/login";
  readonly emailInput = this.page.getByTestId("login-email-input");
  readonly passwordInput = this.page.getByTestId("login-password-input");
  readonly submitButton = this.page.getByTestId("login-submit-button");
  readonly forgotPasswordLink = this.page.getByTestId("forgot-password-link");
  readonly registerLink = this.page.getByTestId("register-link");
  readonly errorNotification = this.page.getByTestId("login-error-notification");
  readonly formContainer = this.page.getByTestId("login-form-container");
  readonly loginHeader = this.page.getByTestId("login-header");

  // Actions
  async goto() {
    await this.page.goto(this.url);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    const error = await this.errorNotification;
    return error.isVisible() ? error.textContent() : null;
  }

  async closeErrorNotification() {
    const error = await this.errorNotification;
    if (await error.isVisible()) {
      await error.getByRole("button", { name: "Close error notification" }).click();
    }
  }

  async navigateToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async navigateToRegister() {
    await this.registerLink.click();
  }

  // State checks
  async isSubmitButtonEnabled() {
    return !(await this.submitButton.isDisabled());
  }

  async isLoading() {
    const buttonText = await this.submitButton.textContent();
    return buttonText === "Signing in...";
  }
}
