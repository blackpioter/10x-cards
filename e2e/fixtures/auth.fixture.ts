import { Page } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

export class AuthFixture {
  constructor(private page: Page) {}

  readonly loginPage = new LoginPage(this.page);

  // Helper methods for common authentication scenarios
  async loginWithValidCredentials(email: string, password: string) {
    await this.loginPage.goto();
    await this.loginPage.login(email, password);
    // Wait for navigation to /generate after successful login
    await this.page.waitForURL("/generate");
  }
}
