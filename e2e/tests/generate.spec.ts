import { test, expect, type Route } from "@playwright/test";
import { GeneratePage } from "../pages/generate.page";
import { FlashcardListPage } from "../pages/flashcard-list.page";
import { LoginPage } from "../pages/login.page";
import { MEMORY_TECHNIQUES_TEXT, SHORT_TEXT } from "../fixtures/generate.fixture";

test.describe("Generate View", () => {
  let generatePage: GeneratePage;
  let flashcardList: FlashcardListPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD environment variables must be set");
    }

    generatePage = new GeneratePage(page);
    flashcardList = new FlashcardListPage(page);
    loginPage = new LoginPage(page);

    // Login before each test
    await loginPage.goto();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("networkidle");
    await loginPage.login(username, password);

    // Verify we're on the generate page
    await expect(page).toHaveURL("/generate");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("networkidle");
    await generatePage.expectTextInputVisible();
  });

  test("should generate flashcards from valid text", async ({ page }) => {
    // Enter valid text and generate
    await generatePage.enterText(MEMORY_TECHNIQUES_TEXT);
    await generatePage.clickGenerate();

    // Verify generation progress UI
    await generatePage.expectGenerationInProgress();
    await expect(page.getByText("Generating flashcards...")).toBeVisible();
    await expect(page.getByTestId("generation-progress")).toBeVisible();

    // Wait for generation to complete
    await generatePage.waitForGenerationComplete();

    // Verify flashcards were generated
    await generatePage.expectReviewSectionVisible();
    const flashcardCount = await page.getByTestId("flashcard-item").count();
    expect(flashcardCount).toBeGreaterThan(5); // Need at least 6 flashcards for the test

    // Verify flashcard content
    const firstFlashcard = page.getByTestId("flashcard-item").first();
    await expect(firstFlashcard.getByTestId("front-content")).not.toBeEmpty();
    await expect(firstFlashcard.getByTestId("back-content")).not.toBeEmpty();

    // Verify flashcard actions are available
    await expect(firstFlashcard.getByTestId("accept-flashcard")).toBeVisible();
    await expect(firstFlashcard.getByTestId("reject-flashcard")).toBeVisible();
    await expect(firstFlashcard.getByTestId("edit-flashcard")).toBeVisible();

    // Review 5 flashcards - accept 3, reject 2
    await flashcardList.acceptFlashcard(0);
    await flashcardList.rejectFlashcard(1);
    await flashcardList.acceptFlashcard(2);
    await flashcardList.rejectFlashcard(3);
    await flashcardList.acceptFlashcard(4);

    // Wait for auto-save
    await page.waitForLoadState("networkidle");

    // Verify stats after reviewing 5 cards
    const stats = await flashcardList.getStats();
    expect(stats.accepted).toBe(3);
    expect(stats.rejected).toBe(2);
    expect(stats.total - stats.accepted - stats.rejected).toBe(flashcardCount - 5);

    // Wait a bit to ensure the stats are stable
    await page.waitForTimeout(1000);

    // Verify stats haven't changed
    const finalStats = await flashcardList.getStats();
    expect(finalStats).toEqual(stats);
  });

  test("should show validation error for short text", async ({ page }) => {
    // Try to generate with invalid text
    await generatePage.enterText(SHORT_TEXT);

    // Verify validation state
    const generateButton = await page.getByTestId("generate-button");
    await expect(generateButton).toBeDisabled();

    const validationMessage = await page.getByTestId("characters-needed");
    await expect(validationMessage).toBeVisible();
    await expect(validationMessage).toContainText("characters needed");
  });

  test("should handle API errors during generation", async ({ page }) => {
    // Mock API to fail
    await test.step("Setup API mock", async () => {
      await page.route("/api/generations", (route: Route) =>
        route.fulfill({
          status: 500,
          body: "Internal Server Error",
        })
      );
    });

    // Try to generate with valid text
    await generatePage.enterText(MEMORY_TECHNIQUES_TEXT);
    await generatePage.clickGenerate({ waitForProgress: false });

    // Verify error handling
    await generatePage.expectErrorVisible("API Error");
  });
});
