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

  // Review Section actions
  async acceptFlashcard(index: number) {
    const acceptButton = this.page.getByRole("button", { name: "Accept" }).nth(index);
    await acceptButton.click();
  }

  async rejectFlashcard(index: number) {
    const rejectButton = this.page.getByRole("button", { name: "Reject" }).nth(index);
    await rejectButton.click();
  }

  async editFlashcard(index: number, { front, back }: { front?: string; back?: string }) {
    // Click edit button for the flashcard
    const editButton = this.page.getByRole("button", { name: "Edit" }).nth(index);
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
    await this.page.getByRole("button", { name: "Accept All" }).click();
  }

  async getReviewStats() {
    const statsText = await this.page.getByText(/\d+ of \d+ reviewed/).textContent();
    const detailsText = await this.page.getByText(/\d+ edited • \d+ accepted • \d+ rejected/).textContent();

    // Parse stats from text
    const reviewed = statsText ? parseInt(statsText.match(/(\d+) of \d+/)?.[1] || "0") : 0;
    const total = statsText ? parseInt(statsText.match(/\d+ of (\d+)/)?.[1] || "0") : 0;

    const editedMatch = detailsText?.match(/(\d+) edited/);
    const acceptedMatch = detailsText?.match(/(\d+) accepted/);
    const rejectedMatch = detailsText?.match(/(\d+) rejected/);

    return {
      reviewed,
      total,
      edited: editedMatch ? parseInt(editedMatch[1]) : 0,
      accepted: acceptedMatch ? parseInt(acceptedMatch[1]) : 0,
      rejected: rejectedMatch ? parseInt(rejectedMatch[1]) : 0,
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
    const flashcardTexts = await this.page.getByText(/^(Front|Back)/).all();

    const frontText = (await flashcardTexts[index * 2].textContent()) || "";
    const backText = (await flashcardTexts[index * 2 + 1].textContent()) || "";

    return {
      front: frontText.replace("Front ", ""),
      back: backText.replace("Back ", ""),
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
