import { type Page, type Locator, expect } from "@playwright/test";

export class TextInputSection {
  readonly page: Page;
  readonly container: Locator;
  readonly textArea: Locator;
  readonly validationMessage: Locator;
  readonly charactersNeeded: Locator;
  readonly generateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-test-id="text-input-form"]');
    this.textArea = page.locator('[data-test-id="source-text-input"]');
    this.validationMessage = page.locator('[data-test-id="validation-message"]');
    this.charactersNeeded = page.locator('[data-test-id="characters-needed"]');
    this.generateButton = page.locator('[data-test-id="generate-button"]');
  }

  async enterText(text: string) {
    await this.textArea.fill(text);
    await this.textArea.blur(); // Trigger validation
  }

  async getCharacterCount(): Promise<number> {
    const text = await this.validationMessage.textContent();
    const match = text?.match(/(\d+) characters/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getCharactersNeeded(): Promise<number> {
    const text = await this.charactersNeeded.textContent();
    const match = text?.match(/(\d+) characters needed/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getValidationError(): Promise<string | null> {
    const hasError = await this.validationMessage.evaluate((el) => el.classList.contains("text-destructive"));
    return hasError ? await this.validationMessage.textContent() : null;
  }

  async isGenerateButtonEnabled(): Promise<boolean> {
    return !(await this.generateButton.isDisabled());
  }

  async clickGenerate() {
    await this.generateButton.click();
  }

  async isVisible() {
    await expect(this.container).toBeVisible();
  }

  async waitForValidation() {
    // Wait for either validation message or characters needed to update
    await Promise.race([
      this.validationMessage.waitFor({ state: "visible" }),
      this.charactersNeeded.waitFor({ state: "visible" }),
    ]);
  }
}
