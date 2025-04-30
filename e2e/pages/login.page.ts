import type { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly url = "/login";
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly errorNotification: Locator;
  readonly formContainer: Locator;
  readonly loginHeader: Locator;

  constructor(public readonly page: Page) {
    this.emailInput = this.page.getByTestId("login-email-input");
    this.passwordInput = this.page.getByTestId("login-password-input");
    this.submitButton = this.page.getByTestId("login-submit-button");
    this.forgotPasswordLink = this.page.getByTestId("forgot-password-link");
    this.registerLink = this.page.getByTestId("register-link");
    this.errorNotification = this.page.getByTestId("error-notification");
    this.formContainer = this.page.getByTestId("login-form-container");
    this.loginHeader = this.page.getByTestId("login-header");
  }

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
    const isVisible = await error.isVisible();
    return isVisible ? error.textContent() : null;
  }

  async closeErrorNotification() {
    const error = await this.errorNotification;
    const isVisible = await error.isVisible();
    if (isVisible) {
      await error.getByTestId("error-notification-close-button").click();
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
