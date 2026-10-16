import { test, expect } from "@playwright/test";

test.describe("Portfolio v3 Comprehensive Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.clear();
      } catch {}
    });
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
    // Scroll to Work section
    const workSection = page.locator("#work");
    await workSection.scrollIntoViewIfNeeded();
    await expect(workSection).toBeVisible();

    // Click first card to open portal
    const firstCard = page.locator(".card").first();
    await expect(firstCard).toBeVisible();
    await page.waitForTimeout(400);
    await firstCard.dispatchEvent("click");

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

  test("3. Verifikasi Mode Tenang (Calm Mode) toggle dan shortcut C", async ({ page }) => {
    const calmBtn = page.locator("#calmBtn");
    await expect(calmBtn).toBeVisible();

    // Verify initially calm is false
    const initialCalm = await page.evaluate(() => document.documentElement.classList.contains("calm"));
    expect(initialCalm).toBe(false);

    // Toggle via button click
    await calmBtn.click();
    await page.waitForTimeout(300);
    const isCalmAfterClick = await page.evaluate(() => document.documentElement.classList.contains("calm"));
    expect(isCalmAfterClick).toBe(true);

    const storedValue = await page.evaluate(() => localStorage.getItem("calm"));
    expect(storedValue).toBe("1");

    // Toggle back via shortcut 'C'
    await page.keyboard.press("KeyC");
    await page.waitForTimeout(300);
    const isCalmAfterKey = await page.evaluate(() => document.documentElement.classList.contains("calm"));
    expect(isCalmAfterKey).toBe(false);
  });

  test("4. Verifikasi Filter Skill di Tentang ke Proyek", async ({ page }) => {
    const aboutSection = page.locator("#about");
    await aboutSection.scrollIntoViewIfNeeded();

    // Find first interactive skill button in marquee
    const firstSkillBtn = page.locator('#about .marq span[role="button"]').first();
    await expect(firstSkillBtn).toBeVisible();

    // Click skill button to filter (use dispatchEvent because marquee has continuous CSS animation)
    await firstSkillBtn.dispatchEvent("click");
    await page.waitForTimeout(300);

    // Toast should show filter count or status
    const toast = page.locator(".toast");
    await expect(toast).not.toHaveText("");

    // Filtered items should have hit or dim classes
    const hitOrDimCard = page.locator(".card.hit, .card.dim").first();
    await expect(hitOrDimCard).toBeVisible();

    // Click again to clear filter
    await firstSkillBtn.dispatchEvent("click");
    await page.waitForTimeout(300);
    await expect(toast).toContainText("Filter dibersihkan");
  });

  test("5. Verifikasi Peti Harta Karun di Kontak", async ({ page }) => {
    const chest = page.locator("#chest");
    await chest.scrollIntoViewIfNeeded();
    await expect(chest).toBeVisible();

    // Settle smooth scroll and reef hint toast
    await page.waitForTimeout(1500);

    // Click treasure chest
    await chest.click();
    await page.waitForTimeout(400);

    // Chest should have open class
    await expect(chest).toHaveClass(/open/);

    // Chest label changes to discovered text
    await expect(chest.locator(".cl")).toHaveText("Harta karun ditemukan!");

    // Verify caption is perfectly centered with chest graphic (< 1px difference)
    const alignmentDiff = await page.evaluate(() => {
      const c = document.querySelector("#chest") as HTMLElement;
      const s = c.querySelector("svg") as SVGElement;
      const l = c.querySelector(".cl") as HTMLElement;
      const sR = s.getBoundingClientRect();
      const lR = l.getBoundingClientRect();
      return Math.abs((sR.left + sR.width / 2) - (lR.left + lR.width / 2));
    });
    expect(alignmentDiff).toBeLessThan(1);
  });

  test("6. Verifikasi Tombol Naik ke Permukaan (#up)", async ({ page }) => {
    // Scroll deep down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const upBtn = page.locator("#up");
    await expect(upBtn).toBeVisible();

    // Click scroll to top
    await upBtn.click();
    await page.waitForTimeout(1000);

    const scrollMetrics = await page.evaluate(() => ({
      scrollY: window.scrollY,
      maxScroll: document.body.scrollHeight,
    }));
    expect(scrollMetrics.scrollY).toBeLessThan(scrollMetrics.maxScroll / 2);
  });

  test("7. Verifikasi Pintasan Keyboard (? untuk bantuan, M untuk bisukan audio)", async ({ page }) => {
    // Ensure window has focus
    await page.locator("body").click();
    await page.waitForTimeout(200);

    const toast = page.locator(".toast");

    // Press '?'
    await page.keyboard.press("?");
    await page.waitForTimeout(400);
    await expect(toast).toContainText(/tenang/i);

    // Press 'm' to toggle audio
    await page.keyboard.press("m");
    await page.waitForTimeout(400);
    await expect(toast).toContainText(/(Audio|Musik)/i);
  });
});
