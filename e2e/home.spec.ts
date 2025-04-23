import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home-page";

test.describe("Strona główna", () => {
  test("powinna się poprawnie załadować", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectPageLoaded();

    // Dodatkowa weryfikacja
    await expect(page).toHaveTitle(/10x Cards/);
  });

  test("powinna wyglądać poprawnie", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForPageLoad();

    // Porównanie wizualne
    await expect(page).toHaveScreenshot("home-page.png");
  });
});
