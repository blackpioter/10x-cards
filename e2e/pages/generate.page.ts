import { type Page, type Locator, expect } from "@playwright/test";
import { E2E_TEST_IDS } from "../constants/test-ids";

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

    // Initialize main component locators using shared constants
    this.textInputSection = page.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.TEXT_INPUT.FORM);
    this.generationProgress = page.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.GENERATION_PROGRESS.CONTAINER);
    this.flashcardReviewSection = page.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.REVIEW_SECTION.CONTAINER);
    this.errorNotification = page.getByTestId(E2E_TEST_IDS.ERROR.CONTAINER);
    this.completionModal = page.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.COMPLETION_MODAL.CONTAINER);
  }

  // Navigation
  async goto() {
    await this.page.goto("/generate");
  }

  // Text Input Section actions
  async enterText(text: string) {
    const textArea = this.textInputSection.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.TEXT_INPUT.TEXTAREA);
    await textArea.fill(text);
  }

  async clickGenerate(options: { waitForProgress?: boolean } = { waitForProgress: true }) {
    // First try to remove the dev toolbar if it exists
    await this.page.evaluate(() => {
      const toolbar = document.querySelector("astro-dev-toolbar");
      if (toolbar) toolbar.remove();
    });

    const generateButton = this.textInputSection.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.TEXT_INPUT.SUBMIT);

    // Check if button is enabled before proceeding
    const isEnabled = await generateButton.isEnabled();
    if (!isEnabled) {
      return;
    }

    await generateButton.click({ force: true });

    // Wait for the generation to start only if requested
    if (options.waitForProgress) {
      await expect(this.generationProgress).toBeVisible({ timeout: 10000 });
    }
  }

  async getCharacterCount() {
    const counter = this.textInputSection.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.TEXT_INPUT.CHARACTER_COUNT);
    return await counter.textContent();
  }

  async getCharactersNeeded() {
    const needed = this.textInputSection.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.TEXT_INPUT.CHARACTERS_NEEDED);
    return await needed.textContent();
  }

  // Generation Progress actions
  async waitForGenerationComplete() {
    await expect(this.flashcardReviewSection).toBeVisible({ timeout: 30000 });
  }

  async cancelGeneration() {
    const cancelButton = this.generationProgress.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.GENERATION_PROGRESS.CANCEL);
    await cancelButton.click();
  }

  // Flashcard Review Section actions
  async filterFlashcards(filter: "all" | "accepted" | "rejected") {
    const filterMap = {
      all: E2E_TEST_IDS.GENERATE_VIEW.REVIEW_SECTION.FILTERS.ALL,
      accepted: E2E_TEST_IDS.GENERATE_VIEW.REVIEW_SECTION.FILTERS.ACCEPTED,
      rejected: E2E_TEST_IDS.GENERATE_VIEW.REVIEW_SECTION.FILTERS.REJECTED,
    };
    const filterButton = this.flashcardReviewSection.getByTestId(filterMap[filter]);
    await filterButton.click();
  }

  async getFlashcardsCount() {
    const allButton = this.flashcardReviewSection.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.REVIEW_SECTION.FILTERS.ALL);
    const countText = await allButton.textContent();
    const match = countText?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async acceptAllFlashcards() {
    const acceptAllButton = this.flashcardReviewSection.getByTestId(
      E2E_TEST_IDS.GENERATE_VIEW.REVIEW_SECTION.ACTIONS.ACCEPT_ALL
    );
    await acceptAllButton.click();
  }

  async getFlashcardStats() {
    const stats = this.flashcardReviewSection.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.REVIEW_SECTION.STATS.CONTAINER);
    const editedCount = await stats.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.REVIEW_SECTION.STATS.EDITED).textContent();
    const acceptedCount = await stats
      .getByTestId(E2E_TEST_IDS.GENERATE_VIEW.REVIEW_SECTION.STATS.ACCEPTED)
      .textContent();
    const rejectedCount = await stats
      .getByTestId(E2E_TEST_IDS.GENERATE_VIEW.REVIEW_SECTION.STATS.REJECTED)
      .textContent();

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
    await this.completionModal.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.COMPLETION_MODAL.GENERATE_NEW).click();
    await expect(this.textInputSection).toBeVisible();
  }

  async clickViewAll() {
    await this.completionModal.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.COMPLETION_MODAL.VIEW_ALL).click();
    await this.page.waitForURL("/flashcards");
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

  async expectCompletionModalVisible() {
    await expect(this.completionModal).toBeVisible();
  }

  async expectErrorVisible(errorType?: string) {
    await expect(this.errorNotification).toBeVisible({ timeout: 10000 });

    if (errorType) {
      await expect(this.errorNotification).toContainText(errorType, { timeout: 10000 });
    }
  }
}
