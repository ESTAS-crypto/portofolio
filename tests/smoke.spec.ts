import { test, expect } from "@playwright/test";

test.describe("Portfolio Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("1. Verifikasi render Hero dan Navigasi", async ({ page }) => {
    // Check main title
    const nameEl = page.locator("#name");
    await expect(nameEl).toBeVisible();
    await expect(nameEl).toContainText("Evan Atharasya");

    // Check navbar brand and links
    const nav = page.locator("#nav");
    await expect(nav).toBeVisible();
    await expect(page.locator('#links a[data-go="about"]')).toBeVisible();
    await expect(page.locator('#links a[data-go="work"]')).toBeVisible();
    await expect(page.locator('#links a[data-go="deep"]')).toBeVisible();

    // Click 'Tentang' link
    await page.click('#links a[data-go="about"]');
    const aboutSection = page.locator("#about");
    await expect(aboutSection).toBeVisible();
  });

  test("2. Verifikasi Project Portal buka, panah keyboard, dan Escape", async ({ page }) => {
    // Scroll to Deep section
    const deepSection = page.locator("#deep");
    await deepSection.scrollIntoViewIfNeeded();
    await expect(deepSection).toBeVisible();

    // Click the first fish to open portal
    const firstFish = page.locator(".fish").first();
    await expect(firstFish).toBeVisible();
    await firstFish.click();

    // Verify modal is open
    const portal = page.locator("#portal");
    await expect(portal).toBeVisible();
    await expect(portal).not.toHaveAttribute("hidden");

    // Verify project content
    const projectTitle = page.locator("#pt");
    await expect(projectTitle).toBeVisible();
    const initialTitle = await projectTitle.textContent();

    // Test ArrowRight key navigation to next project
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    const newTitle = await projectTitle.textContent();
    expect(newTitle).not.toBe(initialTitle);

    // Test Escape key closes the portal
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    await expect(portal).toHaveAttribute("hidden", "");
  });

  test("3. Verifikasi tombol Salin Email dan Toast", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // Scroll to contact section
    const contactSection = page.locator("#contact");
    await contactSection.scrollIntoViewIfNeeded();

    // Click Salin email
    const copyBtn = page.locator("#cpy");
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Verify Toast appears with confirmation text
    const toast = page.locator(".toast");
    await expect(toast).toContainText("Email disalin");
  });
});
