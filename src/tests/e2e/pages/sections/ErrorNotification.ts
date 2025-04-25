import { type Page, type Locator, expect } from "@playwright/test";

export class ErrorNotification {
  readonly page: Page;
  readonly container: Locator;
  readonly icon: Locator;
  readonly title: Locator;
  readonly message: Locator;
  readonly actionButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-test-id="error-notification"]');
    this.icon = page.locator('[data-test-id="error-icon"]');
    this.title = page.locator('[data-test-id="error-title"]');
    this.message = page.locator('[data-test-id="error-message"]');
    this.actionButton = page.locator('[data-test-id="error-action-button"]');
    this.closeButton = page.locator('[data-test-id="close-error"]');
  }

  async getErrorDetails(): Promise<{
    title: string;
    message: string;
    hasAction: boolean;
  }> {
    const title = (await this.title.textContent()) || "";
    const message = (await this.message.textContent()) || "";
    const hasAction = await this.actionButton.isVisible();

    return {
      title,
      message,
      hasAction,
    };
  }

  async clickAction() {
    if (await this.actionButton.isVisible()) {
      await this.actionButton.click();
    }
  }

  async close() {
    await this.closeButton.click();
    await this.container.waitFor({ state: "hidden" });
  }

  async isVisible() {
    return await this.container.isVisible();
  }

  async waitForError(expectedType?: string) {
    await this.container.waitFor({ state: "visible" });
    if (expectedType) {
      await expect(this.title).toContainText(expectedType);
    }
  }
}
