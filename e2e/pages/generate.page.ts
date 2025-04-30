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

    // Wait for button to be enabled and visible
    await expect(generateButton).toBeEnabled();
    await expect(generateButton).toBeVisible();
    await generateButton.click();

    // Wait for the generation to start only if requested
    if (options.waitForProgress) {
      await expect(this.generationProgress).toBeVisible();
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
    // Wait for review section to be visible
    await expect(this.flashcardReviewSection).toBeVisible({ timeout: 30000 });
    await this.page.waitForLoadState("networkidle");
  }

  async cancelGeneration() {
    const cancelButton = this.generationProgress.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.GENERATION_PROGRESS.CANCEL);
    await cancelButton.click();
  }

  // Review Section actions
  async acceptFlashcard(index: number) {
    const acceptButtons = this.page.getByTestId(E2E_TEST_IDS.FLASHCARD_ITEM.ACTIONS.ACCEPT);
    await acceptButtons.nth(index).click();
    await this.page.waitForLoadState("networkidle");
  }

  async rejectFlashcard(index: number) {
    const rejectButtons = this.page.getByTestId(E2E_TEST_IDS.FLASHCARD_ITEM.ACTIONS.REJECT);
    await rejectButtons.nth(index).click();
    await this.page.waitForLoadState("networkidle");
  }

  async editFlashcard(index: number, { front, back }: { front?: string; back?: string }) {
    // Click edit button for the flashcard
    const editButton = this.page.getByRole("button", { name: "Edit" }).nth(index);
    await expect(editButton).toBeEnabled();
    await editButton.click();

    // Fill in the form if values provided
    if (front !== undefined) {
      await this.page.getByLabel("Front").fill(front);
    }
    if (back !== undefined) {
      await this.page.getByLabel("Back").fill(back);
    }

    // Save changes
    await this.page.getByRole("button", { name: "Save" }).click();
  }

  async acceptAllFlashcards() {
    const acceptAllButton = this.page.getByRole("button", { name: "Accept All" });
    await expect(acceptAllButton).toBeEnabled();
    await acceptAllButton.click();
  }

  async getReviewStats() {
    const statsContainer = this.page.getByTestId(E2E_TEST_IDS.FLASHCARD_LIST.STATS.CONTAINER);

    // Wait for stats to be visible and contain numbers
    await expect(statsContainer).toBeVisible();
    await expect(statsContainer).toContainText(/\d+/);

    // Get individual stat elements
    const reviewedText = await statsContainer.textContent();
    const editedCount = await this.page.getByTestId(E2E_TEST_IDS.FLASHCARD_LIST.STATS.EDITED).textContent();
    const acceptedCount = await this.page.getByTestId(E2E_TEST_IDS.FLASHCARD_LIST.STATS.ACCEPTED).textContent();
    const rejectedCount = await this.page.getByTestId(E2E_TEST_IDS.FLASHCARD_LIST.STATS.REJECTED).textContent();

    // Parse reviewed and total from the text
    const reviewMatch = reviewedText?.match(/(\d+) of (\d+) reviewed/);
    if (!reviewMatch) {
      throw new Error("Could not parse review stats - invalid format of reviewed text");
    }

    return {
      reviewed: parseInt(reviewMatch[1]),
      total: parseInt(reviewMatch[2]),
      edited: parseInt(editedCount || "0"),
      accepted: parseInt(acceptedCount || "0"),
      rejected: parseInt(rejectedCount || "0"),
    };
  }

  async filterFlashcards(filter: "all" | "accepted" | "rejected") {
    const buttonText = {
      all: /All \(\d+\)/,
      accepted: /Accepted \(\d+\)/,
      rejected: /Rejected \(\d+\)/,
    };
    await this.page.getByRole("button", { name: buttonText[filter] }).click();
  }

  async getFlashcardContent(index: number) {
    const flashcardFronts = this.page.getByTestId(E2E_TEST_IDS.FLASHCARD_ITEM.CONTENT.FRONT);
    const flashcardBacks = this.page.getByTestId(E2E_TEST_IDS.FLASHCARD_ITEM.CONTENT.BACK);

    const front = await flashcardFronts.nth(index).textContent();
    const back = await flashcardBacks.nth(index).textContent();

    return { front, back };
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
    await expect(this.errorNotification).toBeVisible();
    if (errorType) {
      await expect(this.errorNotification).toContainText(errorType);
    }
  }
}
