import { type Page, type Locator, expect } from "@playwright/test";

export class GenerationProgress {
  readonly page: Page;
  readonly container: Locator;
  readonly spinner: Locator;
  readonly statusMessage: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-test-id="generation-progress"]');
    this.spinner = page.locator('[data-test-id="loading-spinner"]');
    this.statusMessage = page.locator('[data-test-id="status-message"]');
    this.cancelButton = page.locator('[data-test-id="cancel-generation"]');
  }

  async getStatus(): Promise<string> {
    return (await this.statusMessage.textContent()) || "";
  }

  async isSpinnerVisible(): Promise<boolean> {
    return await this.spinner.isVisible();
  }

  async cancel() {
    if (await this.cancelButton.isVisible()) {
      await this.cancelButton.click();
    }
  }

  async isVisible() {
    await expect(this.container).toBeVisible();
  }

  async waitForGeneration() {
    await this.isVisible();
    // Wait until the progress section is no longer visible
    await this.container.waitFor({ state: "hidden" });
  }

  async waitForStatus(status: string) {
    await expect(this.statusMessage).toContainText(status);
  }
}
