import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";
import { TextInputSection } from "./sections/TextInputSection";
import { GenerationProgress } from "./sections/GenerationProgress";
import { FlashcardReviewSection } from "./sections/FlashcardReviewSection";
import { ErrorNotification } from "./sections/ErrorNotification";

export class GenerateViewPage {
  readonly page: Page;
  readonly container: Locator;
  readonly textInputSection: TextInputSection;
  readonly generationProgress: GenerationProgress;
  readonly flashcardReviewSection: FlashcardReviewSection;
  readonly errorNotification: ErrorNotification;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-test-id="generate-view"]');
    this.textInputSection = new TextInputSection(page);
    this.generationProgress = new GenerationProgress(page);
    this.flashcardReviewSection = new FlashcardReviewSection(page);
    this.errorNotification = new ErrorNotification(page);
  }

  async goto() {
    await this.page.goto("/generate");
    await expect(this.container).toBeVisible();
  }

  async generateFlashcards(text: string) {
    await this.textInputSection.enterText(text);
    await this.textInputSection.clickGenerate();
    await this.generationProgress.waitForGeneration();
  }

  async isVisible() {
    await expect(this.container).toBeVisible();
  }

  async hasError() {
    return await this.errorNotification.isVisible();
  }

  async getCurrentStage(): Promise<"input" | "generating" | "review"> {
    const inputVisible = await this.textInputSection.isVisible();
    if (inputVisible) return "input";

    const generatingVisible = await this.generationProgress.isVisible();
    if (generatingVisible) return "generating";

    const reviewVisible = await this.flashcardReviewSection.isVisible();
    if (reviewVisible) return "review";

    throw new Error("Unknown stage");
  }
}
