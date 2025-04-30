import { test, expect, type Route } from "@playwright/test";
import { GeneratePage } from "../pages/generate.page";
import { LoginPage } from "../pages/login.page";
import { MEMORY_TECHNIQUES_TEXT, SHORT_TEXT } from "../fixtures/generate.fixture";
import { E2E_TEST_IDS } from "../constants/test-ids";

test.describe("Generate View", () => {
  let generatePage: GeneratePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD environment variables must be set");
    }

    generatePage = new GeneratePage(page);
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
    await expect(page.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.GENERATION_PROGRESS.CONTAINER)).toBeVisible();

    // Wait for generation to complete
    await generatePage.waitForGenerationComplete();

    // Verify flashcards were generated and review section is visible
    await generatePage.expectReviewSectionVisible();

    // Get initial stats
    const initialStats = await generatePage.getReviewStats();
    expect(initialStats.total).toBeGreaterThan(5);
    expect(initialStats.reviewed).toBe(0);
    expect(initialStats.accepted).toBe(0);
    expect(initialStats.rejected).toBe(0);

    // Keep track of accepted and rejected counts
    let acceptedCount = 0;
    let rejectedCount = 0;

    // Review each flashcard one by one in the review section
    for (let i = 0; i < initialStats.total; i++) {
      // Get current flashcard content to verify it exists
      const flashcard = await generatePage.getFlashcardContent(i);
      expect(flashcard.front).toBeTruthy();
      expect(flashcard.back).toBeTruthy();

      // Randomly decide to accept or reject
      const shouldAccept = Math.random() < 0.5;

      if (shouldAccept) {
        await generatePage.acceptFlashcard(i);
        acceptedCount++;
      } else {
        await generatePage.rejectFlashcard(i);
        rejectedCount++;
      }

      // Verify stats update after each review
      const currentStats = await generatePage.getReviewStats();
      expect(currentStats.reviewed).toBe(i + 1);
      expect(currentStats.accepted).toBe(acceptedCount);
      expect(currentStats.rejected).toBe(rejectedCount);
    }

    // After reviewing all flashcards, verify final stats in the review section
    const finalReviewStats = await generatePage.getReviewStats();
    expect(finalReviewStats.reviewed).toBe(initialStats.total);
    expect(finalReviewStats.accepted).toBe(acceptedCount);
    expect(finalReviewStats.rejected).toBe(rejectedCount);

    // Wait for completion modal to appear
    await generatePage.expectCompletionModalVisible();

    // Click "View All Flashcards" button in the completion modal
    await generatePage.clickViewAll();

    // Verify we're on the flashcards list page
    await expect(page).toHaveURL("/flashcards");
    await page.waitForLoadState("networkidle");

    // Verify the final counts on the flashcards list page match our review choices
    const acceptedFlashcards = await page.locator('[data-status="accepted"]').count();
    const rejectedFlashcards = await page.locator('[data-status="rejected"]').count();

    expect(acceptedFlashcards).toBe(acceptedCount);
    expect(rejectedFlashcards).toBe(rejectedCount);
    expect(acceptedFlashcards + rejectedFlashcards).toBe(initialStats.total);
  });

  test("should show validation error for short text", async ({ page }) => {
    // Try to generate with invalid text
    await generatePage.enterText(SHORT_TEXT);

    // Verify validation state
    const generateButton = await page.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.TEXT_INPUT.SUBMIT);
    await expect(generateButton).toBeDisabled();

    const validationMessage = await page.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.TEXT_INPUT.CHARACTERS_NEEDED);
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
