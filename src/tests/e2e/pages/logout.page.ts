import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class LogoutPage extends BasePage {
  // Selectors as getters
  private get container() {
    return this.getByTestId("logout-container");
  }
  private get loadingMessage() {
    return this.getByTestId("logout-loading");
  }
  private get successMessage() {
    return this.getByTestId("logout-success-message");
  }
  private get redirectMessage() {
    return this.getByTestId("logout-redirect-message");
  }

  // Navigation
  async goto() {
    await this.page.goto("http://localhost:3000/logout");
    await this.waitForElement("logout-container");
  }

  // State checks
  async isLoading() {
    return await this.loadingMessage.isVisible();
  }

  async isSuccessMessageVisible() {
    return await this.successMessage.isVisible();
  }

  async isErrorVisible() {
    const error = this.getByTestId("error-notification");
    return await error.isVisible();
  }

  async getErrorMessage() {
    const error = this.getByTestId("error-message");
    return await error.textContent();
  }

  // Assertions
  async expectSuccessfulLogout() {
    await expect(this.successMessage).toBeVisible();
    await expect(this.redirectMessage).toBeVisible();
    // Wait for redirect
    await this.waitForUrl("http://localhost:3000/login");
  }

  async expectError(message: string) {
    await expect(this.getByTestId("error-message")).toContainText(message);
  }

  // Utility methods
  async waitForRedirect() {
    await this.page.waitForTimeout(2000); // Match the component's timeout
    await this.waitForUrl("http://localhost:3000/login");
  }
}
