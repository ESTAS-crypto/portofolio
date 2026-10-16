import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

const VIEWPORTS = [
  { name: "320", width: 320, height: 568 },
  { name: "375", width: 375, height: 667 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
  { name: "hp-landscape", width: 844, height: 390 },
];

const BASELINE_DIR = path.join(process.cwd(), "docs", "baseline");

test.describe("Capture Baseline Screenshots", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(BASELINE_DIR)) {
      fs.mkdirSync(BASELINE_DIR, { recursive: true });
    }
  });

  for (const vp of VIEWPORTS) {
    test(`Capture baseline for ${vp.name}`, async ({ page }) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.addInitScript(() => {
        try {
          localStorage.setItem("season", "cerah");
          localStorage.setItem("todMin", "0");
        } catch {}
      });

      await page.goto("/?q=hi");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1500);

      // 1. Hero
      const hero = page.locator("#hero");
      if (await hero.isVisible()) {
        await hero.screenshot({
          path: path.join(BASELINE_DIR, `hero-${vp.name}.png`),
        });
      }

      // 2. Time panel
      const todx = page.locator("#todx");
      if (await todx.isVisible()) {
        await todx.screenshot({
          path: path.join(BASELINE_DIR, `timepanel-${vp.name}.png`),
        });
      }

      // 3. Navbar
      const nav = page.locator("#nav");
      if (await nav.isVisible()) {
        await nav.screenshot({
          path: path.join(BASELINE_DIR, `nav-${vp.name}.png`),
        });
      }

      // 4. Burger menu (if burger button is visible)
      const burger = page.locator("#burger");
      if (await burger.isVisible()) {
        await burger.dispatchEvent("click");
        await page.waitForTimeout(600);
        const menu = page.locator("#menu");
        if (await menu.isVisible()) {
          await page.screenshot({
            path: path.join(BASELINE_DIR, `burger-menu-${vp.name}.png`),
          });
        }
        await page.keyboard.press("Escape");
        await page.waitForTimeout(400);
      }

      // 5. Contact
      const contact = page.locator("#contact");
      await contact.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      if (await contact.isVisible()) {
        await contact.screenshot({
          path: path.join(BASELINE_DIR, `contact-${vp.name}.png`),
        });
      }

      // 6. Project Portal
      const work = page.locator("#work");
      await work.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const firstCard = page.locator(".card").first();
      if (await firstCard.isVisible()) {
        await firstCard.dispatchEvent("click");
        await page.waitForTimeout(900);
        const portal = page.locator("#portal");
        if (await portal.isVisible()) {
          await page.screenshot({
            path: path.join(BASELINE_DIR, `portal-${vp.name}.png`),
          });
        }
        await page.keyboard.press("Escape");
        await page.waitForTimeout(400);
      }
    });
  }
});
