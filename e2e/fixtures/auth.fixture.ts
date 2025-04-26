import { Page } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { expect } from "@playwright/test";

export class AuthFixture {
  constructor(private page: Page) {}

  readonly loginPage = new LoginPage(this.page);

  // Helper methods for common authentication scenarios
  async loginWithValidCredentials(email: string, password: string) {
    await this.loginPage.goto();
    await this.loginPage.login(email, password);
    await expect(this.page).toHaveURL("/generate");
  }
}
