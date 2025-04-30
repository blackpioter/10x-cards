import { type Page, type Locator, expect } from "@playwright/test";
import { TEST_IDS as GENERATE_TEST_IDS } from "../../src/components/generate/GenerateView/constants";
import { TEST_IDS as ERROR_TEST_IDS } from "../../src/components/common/ErrorNotification/constants";

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
    this.textInputSection = page.getByTestId(GENERATE_TEST_IDS.TEXT_INPUT.FORM);
    this.generationProgress = page.getByTestId(GENERATE_TEST_IDS.GENERATION_PROGRESS.CONTAINER);
    this.flashcardReviewSection = page.getByTestId(GENERATE_TEST_IDS.REVIEW_SECTION.CONTAINER);
    this.errorNotification = page.getByTestId(ERROR_TEST_IDS.CONTAINER);
    this.completionModal = page.getByTestId(GENERATE_TEST_IDS.COMPLETION_MODAL.CONTAINER);
  }

  // Navigation
  async goto() {
    await this.page.goto("/generate");
  }

  // Text Input Section actions
  async enterText(text: string) {
    const textArea = this.textInputSection.getByTestId(GENERATE_TEST_IDS.TEXT_INPUT.TEXTAREA);
    await textArea.fill(text);
  }

  async clickGenerate(options: { waitForProgress?: boolean } = { waitForProgress: true }) {
    // First try to remove the dev toolbar if it exists
    await this.page.evaluate(() => {
      const toolbar = document.querySelector("astro-dev-toolbar");
      if (toolbar) toolbar.remove();
    });

    const generateButton = this.textInputSection.getByTestId(GENERATE_TEST_IDS.TEXT_INPUT.SUBMIT);

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
    const counter = this.textInputSection.getByTestId(GENERATE_TEST_IDS.TEXT_INPUT.CHARACTER_COUNT);
    return await counter.textContent();
  }

  async getCharactersNeeded() {
    const needed = this.textInputSection.getByTestId(GENERATE_TEST_IDS.TEXT_INPUT.CHARACTERS_NEEDED);
    return await needed.textContent();
  }

  // Generation Progress actions
  async waitForGenerationComplete() {
    // Wait for the review section to appear, which indicates generation is complete
    await expect(this.flashcardReviewSection).toBeVisible({ timeout: 30000 });
  }

  async cancelGeneration() {
    const cancelButton = this.generationProgress.getByTestId(GENERATE_TEST_IDS.GENERATION_PROGRESS.CANCEL);
    await cancelButton.click();
  }

  // Flashcard Review Section actions
  async filterFlashcards(filter: "all" | "accepted" | "rejected") {
    const filterButton = this.flashcardReviewSection.getByTestId(
      GENERATE_TEST_IDS.REVIEW_SECTION.FILTERS[
        filter.toUpperCase() as keyof typeof GENERATE_TEST_IDS.REVIEW_SECTION.FILTERS
      ]
    );
    await filterButton.click();
  }

  async getFlashcardsCount() {
    const allButton = this.flashcardReviewSection.getByTestId(GENERATE_TEST_IDS.REVIEW_SECTION.FILTERS.ALL);
    const countText = await allButton.textContent();
    const match = countText?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async acceptAllFlashcards() {
    const acceptAllButton = this.flashcardReviewSection.getByTestId(
      GENERATE_TEST_IDS.REVIEW_SECTION.ACTIONS.ACCEPT_ALL
    );
    await acceptAllButton.click();
  }

  async getFlashcardStats() {
    const stats = this.flashcardReviewSection.getByTestId(GENERATE_TEST_IDS.REVIEW_SECTION.STATS.CONTAINER);
    const editedCount = await stats.getByTestId(GENERATE_TEST_IDS.REVIEW_SECTION.STATS.EDITED).textContent();
    const acceptedCount = await stats.getByTestId(GENERATE_TEST_IDS.REVIEW_SECTION.STATS.ACCEPTED).textContent();
    const rejectedCount = await stats.getByTestId(GENERATE_TEST_IDS.REVIEW_SECTION.STATS.REJECTED).textContent();

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
    await this.completionModal.getByTestId(GENERATE_TEST_IDS.COMPLETION_MODAL.GENERATE_NEW).click();
    await expect(this.textInputSection).toBeVisible();
  }

  async clickViewAll() {
    await this.completionModal.getByTestId(GENERATE_TEST_IDS.COMPLETION_MODAL.VIEW_ALL).click();
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
      return await this.errorNotification.getByTestId(ERROR_TEST_IDS.MESSAGE).textContent();
    }
    return null;
  }

  async dismissError() {
    if (await this.errorNotification.isVisible()) {
      await this.errorNotification.getByTestId(ERROR_TEST_IDS.CLOSE).click();
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
