import { type Page, type Locator, expect } from "@playwright/test";
import { TEST_IDS } from "../../src/components/FlashcardList/constants";

export class FlashcardListPage {
  readonly page: Page;
  readonly container: Locator;
  readonly flashcardsView: Locator;
  readonly filters: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flashcardsView = page.getByTestId("flashcards-view");
    this.container = page.getByTestId(TEST_IDS.CONTAINER);
    this.filters = page.getByTestId(TEST_IDS.FILTERS.CONTAINER);
  }

  // Flashcard actions
  async acceptFlashcard(index: number) {
    const flashcard = this.getFlashcardByIndex(index);
    await flashcard.getByTestId(TEST_IDS.ACTIONS.ACCEPT).click();
  }

  async rejectFlashcard(index: number) {
    const flashcard = this.getFlashcardByIndex(index);
    await flashcard.getByTestId(TEST_IDS.ACTIONS.REJECT).click();
  }

  async editFlashcard(index: number, { front, back }: { front?: string; back?: string }) {
    const flashcard = this.getFlashcardByIndex(index);
    await flashcard.getByTestId(TEST_IDS.ACTIONS.EDIT).click();

    if (front !== undefined) {
      await flashcard.getByLabel("Front").fill(front);
    }
    if (back !== undefined) {
      await flashcard.getByLabel("Back").fill(back);
    }

    await flashcard.getByTestId(TEST_IDS.ACTIONS.SAVE_EDIT).click();
  }

  async restoreFlashcard(index: number) {
    const flashcard = this.getFlashcardByIndex(index);
    await flashcard.getByTestId(TEST_IDS.ACTIONS.RESTORE).click();
  }

  // Bulk actions
  async acceptAll() {
    await this.container.getByTestId(TEST_IDS.ACTIONS.ACCEPT_ALL).click();
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
    await expect(this.container.getByTestId(TEST_IDS.ITEM)).toHaveCount(count);
  }

  async expectFlashcardStatus(index: number, status: "pending" | "accepted" | "rejected") {
    const flashcard = this.getFlashcardByIndex(index);
    await expect(flashcard).toHaveAttribute("data-status", status);
  }

  async expectFlashcardContent(index: number, { front, back }: { front?: string; back?: string }) {
    const flashcard = this.getFlashcardByIndex(index);
    if (front !== undefined) {
      await expect(flashcard.getByTestId(TEST_IDS.CONTENT.FRONT)).toHaveText(front);
    }
    if (back !== undefined) {
      await expect(flashcard.getByTestId(TEST_IDS.CONTENT.BACK)).toHaveText(back);
    }
  }

  // Helper methods
  private getFlashcardByIndex(index: number): Locator {
    return this.container.getByTestId(TEST_IDS.ITEM).nth(index);
  }

  private async getFilterCount(filter: "all" | "pending" | "accepted" | "rejected"): Promise<number> {
    const filterKey = filter.toUpperCase() as "ALL" | "ACCEPTED" | "REJECTED";
    const countElement = this.filters.getByTestId(TEST_IDS.FILTERS[filterKey].COUNT);
    await expect(countElement).toBeVisible({ timeout: 5000 });
    const text = await countElement.textContent();
    const match = text?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }
}
