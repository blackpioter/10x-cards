import { Page, Locator, expect } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Nawiguje do podanej ścieżki
   */
  async goto(path = "/") {
    await this.page.goto(path);
  }

  /**
   * Oczekuje na załadowanie strony
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Wykonuje zrzut ekranu dla celów porównawczych
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }

  /**
   * Sprawdza czy element jest widoczny
   */
  async expectVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  /**
   * Sprawdza czy element zawiera określony tekst
   */
  async expectToHaveText(locator: Locator, text: string) {
    await expect(locator).toHaveText(text);
  }
}
