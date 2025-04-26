import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

export class HomePage extends BasePage {
  readonly heading: Locator;
  readonly cardsContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.locator("h1");
    this.cardsContainer = this.page.locator('[data-testid="cards-container"]');
  }

  /**
   * Nawiguje do strony głównej
   */
  async goto() {
    await super.goto("/");
  }

  /**
   * Sprawdza czy strona główna jest poprawnie załadowana
   */
  async expectPageLoaded() {
    await this.expectVisible(this.heading);
    await this.expectVisible(this.cardsContainer);
  }
}
