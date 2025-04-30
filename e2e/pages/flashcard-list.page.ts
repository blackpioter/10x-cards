import { type Page, type Locator, expect } from "@playwright/test";

export class FlashcardListPage {
  readonly page: Page;
  readonly container: Locator;
  readonly flashcardsView: Locator;
  readonly filters: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flashcardsView = page.getByTestId("flashcards-view");
    this.container = page.getByTestId("flashcard-list");
    this.filters = page.getByTestId("flashcard-filters");
  }

  // Flashcard actions
  async acceptFlashcard(index: number) {
    const flashcard = this.getFlashcardByIndex(index);
    await flashcard.getByTestId("accept-flashcard").click();
  }

  async rejectFlashcard(index: number) {
    const flashcard = this.getFlashcardByIndex(index);
    await flashcard.getByTestId("reject-flashcard").click();
  }

  async editFlashcard(index: number, { front, back }: { front?: string; back?: string }) {
    const flashcard = this.getFlashcardByIndex(index);
    await flashcard.getByTestId("edit-flashcard").click();

    if (front !== undefined) {
      await flashcard.getByLabel("Front").fill(front);
    }
    if (back !== undefined) {
      await flashcard.getByLabel("Back").fill(back);
    }

    await flashcard.getByTestId("save-edit").click();
  }

  async restoreFlashcard(index: number) {
    const flashcard = this.getFlashcardByIndex(index);
    await flashcard.getByTestId("restore-flashcard").click();
  }

  // Bulk actions
  async acceptAll() {
    await this.container.getByTestId("accept-all").click();
  }

  // Stats
  async getStats() {
    // Wait for the filters to be visible first
    await expect(this.filters).toBeVisible({ timeout: 10000 });

    // Get counts from filter buttons
    const allCount = await this.getFilterCount("all");
    const acceptedCount = await this.getFilterCount("accepted");
    const rejectedCount = await this.getFilterCount("rejected");

    return {
      total: allCount,
      accepted: acceptedCount,
      rejected: rejectedCount,
      edited: 0, // We don't show edited count in filter buttons
    };
  }

  // Assertions
  async expectFlashcardCount(count: number) {
    await expect(this.container.getByTestId("flashcard-item")).toHaveCount(count);
  }

  async expectFlashcardStatus(index: number, status: "pending" | "accepted" | "rejected") {
    const flashcard = this.getFlashcardByIndex(index);
    await expect(flashcard).toHaveAttribute("data-status", status);
  }

  async expectFlashcardContent(index: number, { front, back }: { front?: string; back?: string }) {
    const flashcard = this.getFlashcardByIndex(index);
    if (front !== undefined) {
      await expect(flashcard.getByTestId("front-content")).toHaveText(front);
    }
    if (back !== undefined) {
      await expect(flashcard.getByTestId("back-content")).toHaveText(back);
    }
  }

  // Helper methods
  private getFlashcardByIndex(index: number): Locator {
    return this.container.getByTestId("flashcard-item").nth(index);
  }

  private async getFilterCount(filter: "all" | "pending" | "accepted" | "rejected"): Promise<number> {
    const countElement = this.filters.getByTestId(`filter-${filter}-count`);
    await expect(countElement).toBeVisible({ timeout: 5000 });
    const text = await countElement.textContent();
    const match = text?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }
}
