import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  protected async waitForUrl(url: string) {
    await expect(this.page).toHaveURL(url);
  }

  protected async waitForElement(testId: string) {
    const element = this.page.getByTestId(testId);
    await expect(element).toBeVisible();
    return element;
  }

  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }
}
