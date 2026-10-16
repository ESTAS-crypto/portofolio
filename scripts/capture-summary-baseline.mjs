import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASELINE_DIR = path.join(process.cwd(), "docs", "baseline");
if (!fs.existsSync(BASELINE_DIR)) {
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "360", width: 360, height: 740 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

async function run() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    await page.goto("http://localhost:3001/?q=hi");
    await page.waitForTimeout(1500);

    // Click Ringkasan button in Nav or Menu
    if (vp.width <= 768) {
      // Open burger menu then click Ringkasan
      const burger = page.locator("#burger");
      if (await burger.isVisible()) {
        await burger.click();
        await page.waitForTimeout(500);
        await page.locator('#menu button[data-act="sum"]').click();
      } else {
        await page.locator("#sumBtn").click();
      }
    } else {
      await page.locator("#sumBtn").click();
    }

    await page.waitForTimeout(800);

    // Screenshot dialog
    const modal = page.locator("#sumOv");
    if (await modal.isVisible()) {
      await page.screenshot({ path: path.join(BASELINE_DIR, `summary-dialog-${vp.name}.png`) });
    }

    await context.close();
  }

  await browser.close();
  console.log("BASELINE SUMMARY DIALOG SCREENSHOTS CAPTURED!");
}

run().catch(console.error);
