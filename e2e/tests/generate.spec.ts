import { test, expect, type Route } from "@playwright/test";
import { GeneratePage } from "../pages/generate.page";
import { FlashcardListPage } from "../pages/flashcard-list.page";
import { LoginPage } from "../pages/login.page";
import { MEMORY_TECHNIQUES_TEXT, SHORT_TEXT } from "../fixtures/generate.fixture";
import { E2E_TEST_IDS } from "../constants/test-ids";

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
    await expect(page.getByTestId(E2E_TEST_IDS.GENERATE_VIEW.GENERATION_PROGRESS.CONTAINER)).toBeVisible();

    // Wait for generation to complete
    await generatePage.waitForGenerationComplete();

    // Verify flashcards were generated
    await generatePage.expectReviewSectionVisible();
    const totalFlashcards = await page.getByTestId(E2E_TEST_IDS.FLASHCARD_LIST.ITEM).count();
    expect(totalFlashcards).toBeGreaterThan(5);

    // Keep track of accepted and rejected counts
    let acceptedCount = 0;
    let rejectedCount = 0;

    // Review all flashcards randomly
    for (let i = 0; i < totalFlashcards; i++) {
      const shouldAccept = Math.random() < 0.5;
      if (shouldAccept) {
        await flashcardList.acceptFlashcard(i);
        acceptedCount++;
      } else {
        await flashcardList.rejectFlashcard(i);
        rejectedCount++;
      }
    }

    // Wait for auto-save and completion modal
    await page.waitForLoadState("networkidle");

    // Verify completion modal appears
    await generatePage.expectCompletionModalVisible();

    // Click "View All Flashcards" button
    await generatePage.clickViewAll();

    // Verify we're on the flashcards list page
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/flashcards");

    // Get stats from the flashcards list
    const stats = await flashcardList.getStats();

    // Verify the counts match our tracking
    expect(stats.accepted).toBe(acceptedCount);
    expect(stats.rejected).toBe(rejectedCount);
    expect(stats.total).toBe(totalFlashcards);
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
