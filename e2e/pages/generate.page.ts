import { type Page, type Locator, expect } from "@playwright/test";

export class GeneratePage {
  readonly page: Page;

  // Main sections
  readonly textInputSection: Locator;
  readonly generationProgress: Locator;
  readonly flashcardReviewSection: Locator;
  readonly errorNotification: Locator;
  readonly completionModal: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize main component locators
    this.textInputSection = page.getByTestId("text-input-form");
    this.generationProgress = page.getByTestId("generation-progress");
    this.flashcardReviewSection = page.getByTestId("flashcard-review-section");
    this.errorNotification = page.getByTestId("error-notification");
    this.completionModal = page.getByTestId("completion-modal");
  }

  // Navigation
  async goto() {
    await this.page.goto("/generate");
  }

  // Text Input Section actions
  async enterText(text: string) {
    const textArea = this.textInputSection.getByTestId("source-text-input");
    await textArea.fill(text);
  }

  async clickGenerate(options: { waitForProgress?: boolean } = { waitForProgress: true }) {
    // First try to remove the dev toolbar if it exists
    await this.page.evaluate(() => {
      const toolbar = document.querySelector("astro-dev-toolbar");
      if (toolbar) toolbar.remove();
    });

    const generateButton = this.textInputSection.getByTestId("generate-button");

    // Check if button is enabled before proceeding
    const isEnabled = await generateButton.isEnabled();
    if (!isEnabled) {
      return; // Don't try to click or wait for progress if button is disabled
    }

    await generateButton.click({ force: true });

    // Wait for the generation to start only if requested
    if (options.waitForProgress) {
      await expect(this.generationProgress).toBeVisible({ timeout: 10000 });
    }
  }

  async getCharacterCount() {
    const counter = this.textInputSection.getByTestId("character-count");
    return await counter.textContent();
  }

  async getCharactersNeeded() {
    const needed = this.textInputSection.getByTestId("characters-needed");
    return await needed.textContent();
  }

  // Generation Progress actions
  async waitForGenerationComplete() {
    // Wait for the review section to appear, which indicates generation is complete
    await expect(this.flashcardReviewSection).toBeVisible({ timeout: 30000 });
  }

  async cancelGeneration() {
    const cancelButton = this.generationProgress.getByTestId("cancel-generation");
    await cancelButton.click();
  }

  // Flashcard Review Section actions
  async filterFlashcards(filter: "all" | "accepted" | "rejected") {
    const filterButton = this.flashcardReviewSection.getByTestId(`filter-${filter}`);
    await filterButton.click();
  }

  async getFlashcardsCount() {
    const allButton = this.flashcardReviewSection.getByTestId("filter-all");
    const countText = await allButton.textContent();
    const match = countText?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async acceptAllFlashcards() {
    const acceptAllButton = this.flashcardReviewSection.getByTestId("accept-all");
    await acceptAllButton.click();
  }

  async getFlashcardStats() {
    const stats = this.flashcardReviewSection.getByTestId("flashcard-stats");
    const editedCount = await stats.getByTestId("stat-edited").textContent();
    const acceptedCount = await stats.getByTestId("stat-accepted").textContent();
    const rejectedCount = await stats.getByTestId("stat-rejected").textContent();

    return {
      edited: parseInt(editedCount || "0"),
      accepted: parseInt(acceptedCount || "0"),
      rejected: parseInt(rejectedCount || "0"),
    };
  }

  // Completion Modal actions
  async waitForCompletionModal() {
    await expect(this.completionModal).toBeVisible({ timeout: 10000 });
  }

  async clickGenerateNew() {
    await this.completionModal.getByTestId("generate-new-button").click();
    await expect(this.textInputSection).toBeVisible();
  }

  async clickViewAll() {
    await this.completionModal.getByTestId("view-all-button").click();
    await this.page.waitForURL("/flashcards");
  }

  async expectCompletionModalVisible() {
    await expect(this.completionModal).toBeVisible();
  }

  async waitForReviewComplete() {
    // Wait for completion modal to appear
    await this.waitForCompletionModal();
  }

  // Error handling
  async getErrorMessage() {
    if (await this.errorNotification.isVisible()) {
      return await this.errorNotification.getByTestId("error-message").textContent();
    }
    return null;
  }

  async dismissError() {
    if (await this.errorNotification.isVisible()) {
      await this.errorNotification.getByTestId("close-error-button").click();
    }
  }

  // State assertions
  async expectTextInputVisible() {
    await expect(this.textInputSection).toBeVisible();
  }

  async expectGenerationInProgress() {
    await expect(this.generationProgress).toBeVisible();
  }

  async expectReviewSectionVisible() {
    await expect(this.flashcardReviewSection).toBeVisible();
  }

  async expectErrorVisible(errorType?: string) {
    // First wait for the notification to be visible
    await expect(this.errorNotification).toBeVisible({ timeout: 10000 });

    if (errorType) {
      // Wait for the title text to be visible in the notification
      await expect(this.errorNotification).toContainText(errorType, { timeout: 10000 });
    }
  }
}
