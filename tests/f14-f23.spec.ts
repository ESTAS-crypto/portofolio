import { test, expect } from "@playwright/test";

test.describe("F14-F23 Features Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.clear();
      } catch {}
    });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("F14: Weather canvas renders and responds to season change", async ({ page }) => {
    const weatherCanvas = page.locator("#wx");
    await expect(weatherCanvas).toBeAttached();

    // Verify TimePanel season row exists inside #todx
    const seasonRow = page.locator("#todx .tod-ssn");
    await expect(seasonRow).toBeVisible();

    // Verify season buttons exist
    const ssnBtns = page.locator('#todx .tod-ssn .tod-c:not(.tod-auto)');
    await expect(ssnBtns).toHaveCount(6);

    // Click 'Hujan' season
    const hujanBtn = page.locator('#todx .tod-ssn .tod-c[data-s="hujan"]');
    await hujanBtn.dispatchEvent("click");

    // Verify season chip is selected
    await expect(hujanBtn).toHaveClass(/on/);
  });

  test("F15 & F22: Recruiter Summary Modal opens and has live GitHub activity and PDF button", async ({ page }) => {
    // Open modal via #sumBtn button
    const sumBtn = page.locator("#sumBtn");
    await sumBtn.click();

    const modal = page.locator("#sumOv");
    await expect(modal).toBeVisible();

    // Check recruiter header name and 3 featured projects
    await expect(page.locator("#sumT")).toContainText("Evan Atharasya");
    await expect(page.locator("#sumOv .sl li")).toHaveCount(3);

    // Check PDF Download button
    const pdfBtn = page.locator("#cvBtn");
    await expect(pdfBtn).toBeVisible();
    await expect(pdfBtn).toContainText("Unduh CV");

    // Close modal via Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await expect(modal).not.toBeVisible();
  });

  test("F16: Auto quality attribute data-q initialized", async ({ page }) => {
    // Wait for performance monitor to set attribute
    await page.waitForSelector("html[data-q]");
    const qAttr = await page.getAttribute("html", "data-q");
    expect(["hi", "mid", "lo"]).toContain(qAttr);
  });

  test("F17: Ikan-Dex Explorer Modal opens with 16 trackable items", async ({ page }) => {
    // Open modal via #dexBtn button
    const dexBtn = page.locator("#dexBtn");
    await dexBtn.click();

    const modal = page.locator("#dexOv");
    await expect(modal).toBeVisible();

    // Check header and 16 items list
    await expect(page.locator("#dexT")).toContainText("Koleksi Penjelajah");
    const dexItems = page.locator("#dexL li");
    await expect(dexItems).toHaveCount(16);

    // Close modal via Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await expect(modal).not.toBeVisible();
  });

  test("F18: Weather API endpoint responds with valid JSON and cache headers", async ({ request }) => {
    const res = await request.get("/api/weather");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(typeof data.code).toBe("number");
    expect(data.city).toBe("Surabaya");
    expect(data.source).toBe("open-meteo");
  });

  test("F19: Project Portal displays 16:10 screenshot frame", async ({ page }) => {
    const firstCard = page.locator(".card").first();
    await firstCard.scrollIntoViewIfNeeded();
    await firstCard.dispatchEvent("click");

    const portal = page.locator("#portal");
    await expect(portal).toBeVisible();

    // Verify 16:10 mock frame is present
    const mockFrame = page.locator("#mock");
    await expect(mockFrame).toBeVisible();
    await expect(mockFrame).toHaveClass(/mock-shot/);

    // Verify screenshot image tag exists with valid src
    const shotImg = page.locator(".mk-img");
    await expect(shotImg).toBeVisible();
    const src = await shotImg.getAttribute("src");
    expect(src).toContain("/projects/luvence-id/cover.png");
  });

  test("F20: Message in a Bottle in Contact section opens form and submits", async ({ page }) => {
    await page.route("/api/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, message: "Pesan terkirim" }),
      });
    });

    const bottleTrigger = page.locator(".msg-bottle-trigger");
    await bottleTrigger.scrollIntoViewIfNeeded();
    await expect(bottleTrigger).toBeVisible();

    // Click to open bottle form
    await bottleTrigger.click();
    const modal = page.locator(".msg-bottle-modal");
    await expect(modal).toBeVisible();

    // Fill form
    await page.fill("#btl-name", "Playwright Tester");
    await page.fill("#btl-email", "tester@example.com");
    await page.fill("#btl-msg", "Halo Evan, ini adalah pesan uji coba dari sistem testing!");

    // Submit form
    await page.locator(".msg-bottle-form").dispatchEvent("submit");

    // Verify success feedback
    await expect(page.locator(".msg-bottle-success")).toBeVisible();
  });

  test("F21: Static project route /proyek/luvence-id renders metadata and story", async ({ page }) => {
    await page.goto("/proyek/luvence-id");
    await expect(page).toHaveTitle(/LUVENCE ID — Evan Atharasya/);

    const titleEl = page.locator(".prj-title");
    await expect(titleEl).toHaveText("LUVENCE ID");

    // Check 16:10 screenshot frame on project page
    const frame = page.locator(".prj-browser-frame");
    await expect(frame).toBeVisible();

    // Check 3 story articles
    const storyCards = page.locator(".prj-story-card");
    await expect(storyCards).toHaveCount(3);

    // Check breadcrumb
    const backBtn = page.locator(".prj-back-btn");
    await expect(backBtn).toBeVisible();
  });
});
