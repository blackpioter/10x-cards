import { type Page, type Locator, expect } from "@playwright/test";

export class FlashcardReviewSection {
  readonly page: Page;
  readonly container: Locator;
  readonly filterButtons: Locator;
  readonly filterAll: Locator;
  readonly filterAccepted: Locator;
  readonly filterRejected: Locator;
  readonly flashcardList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-test-id="review-section"]');
    this.filterButtons = page.locator('[data-test-id="filter-buttons"]');
    this.filterAll = page.locator('[data-test-id="filter-all"]');
    this.filterAccepted = page.locator('[data-test-id="filter-accepted"]');
    this.filterRejected = page.locator('[data-test-id="filter-rejected"]');
    this.flashcardList = page.locator('[data-test-id="flashcard-list"]');
  }

  async getFlashcardCount(): Promise<{ total: number; accepted: number; rejected: number }> {
    const allText = (await this.filterAll.textContent()) || "";
    const acceptedText = (await this.filterAccepted.textContent()) || "";
    const rejectedText = (await this.filterRejected.textContent()) || "";

    return {
      total: this.extractNumber(allText),
      accepted: this.extractNumber(acceptedText),
      rejected: this.extractNumber(rejectedText),
    };
  }

  private extractNumber(text: string): number {
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async filterBy(filter: "all" | "accepted" | "rejected") {
    switch (filter) {
      case "all":
        await this.filterAll.click();
        break;
      case "accepted":
        await this.filterAccepted.click();
        break;
      case "rejected":
        await this.filterRejected.click();
        break;
    }
    // Wait for the list to update
    await this.page.waitForTimeout(100);
  }

  async getFlashcard(index: number) {
    return this.page.locator(`[data-test-id="flashcard-item-${index}"]`);
  }

  async acceptFlashcard(index: number) {
    const flashcard = await this.getFlashcard(index);
    await flashcard.locator('[data-test-id^="accept-button-"]').click();
  }

  async rejectFlashcard(index: number) {
    const flashcard = await this.getFlashcard(index);
    await flashcard.locator('[data-test-id^="reject-button-"]').click();
  }

  async editFlashcard(index: number, { front, back }: { front?: string; back?: string }) {
    const flashcard = await this.getFlashcard(index);
    if (front !== undefined) {
      await flashcard.locator("textarea").first().fill(front);
    }
    if (back !== undefined) {
      await flashcard.locator("textarea").nth(1).fill(back);
    }
  }

  async restoreFlashcard(index: number) {
    const flashcard = await this.getFlashcard(index);
    await flashcard.locator('[data-test-id^="restore-button-"]').click();
  }

  async isVisible() {
    await expect(this.container).toBeVisible();
  }

  async waitForFlashcards() {
    await this.flashcardList.waitFor();
    await expect(this.flashcardList).toBeVisible();
  }
}
