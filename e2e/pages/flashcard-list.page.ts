import { type Page, type Locator, expect } from "@playwright/test";

export class FlashcardListPage {
  readonly page: Page;
  readonly container: Locator;
  readonly reviewSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId("flashcard-list");
    this.reviewSection = page.getByTestId("flashcard-review-section");
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
      await flashcard.getByTestId("front-input").fill(front);
    }
    if (back !== undefined) {
      await flashcard.getByTestId("back-input").fill(back);
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

  async saveAccepted() {
    await this.container.getByTestId("save-accepted").click();
  }

  // Stats
  async getStats() {
    const filterButtons = this.reviewSection.getByTestId("filter-buttons");

    // Get total from "All" button text which shows "(X)"
    const allButtonText = (await filterButtons.getByTestId("filter-all").textContent()) || "";
    const totalMatch = allButtonText.match(/\((\d+)\)/);
    const total = totalMatch ? parseInt(totalMatch[1]) : 0;

    // Get accepted from "Accepted" button text which shows "(X)"
    const acceptedButtonText = (await filterButtons.getByTestId("filter-accepted").textContent()) || "";
    const acceptedMatch = acceptedButtonText.match(/\((\d+)\)/);
    const accepted = acceptedMatch ? parseInt(acceptedMatch[1]) : 0;

    // Get rejected from "Rejected" button text which shows "(X)"
    const rejectedButtonText = (await filterButtons.getByTestId("filter-rejected").textContent()) || "";
    const rejectedMatch = rejectedButtonText.match(/\((\d+)\)/);
    const rejected = rejectedMatch ? parseInt(rejectedMatch[1]) : 0;

    return {
      total,
      accepted,
      rejected,
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

  private async getStatValue(stats: Locator, type: string): Promise<number> {
    const text = await stats.getByTestId(`stat-${type}`).textContent();
    return text ? parseInt(text) : 0;
  }
}
