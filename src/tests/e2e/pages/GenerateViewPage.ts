import { Page, Locator, expect } from "@playwright/test";
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
    if (await this.textInputSection.isVisible()) return "input";
    if (await this.generationProgress.isVisible()) return "generating";
    if (await this.flashcardReviewSection.isVisible()) return "review";
    throw new Error("Unknown stage");
  }
}
