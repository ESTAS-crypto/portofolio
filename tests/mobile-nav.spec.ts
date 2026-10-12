import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("Mobile Nav: Hamburger menu opens, items can be clicked and navigate correctly, and nav does not vanish on fast scroll", async ({
  page,
}) => {
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  await page.goto("/");
  await page.waitForTimeout(1000);

  const nav = page.locator("#nav");
  await expect(nav).toBeVisible();

  // Test 1: Burger button opens mobile menu
  const burger = page.locator("#burger");
  await expect(burger).toBeVisible();
  await burger.click();
  await page.waitForTimeout(500);

  const menu = page.locator("#menu");
  await expect(menu).toBeVisible();

  // Test 2: Clicking 'Tentang' navigates to #about section and closes menu
  const aboutLink = page.locator('#menu a[href="#about"]');
  await expect(aboutLink).toBeVisible();
  await aboutLink.click();
  await page.waitForTimeout(1200);

  // Menu should be hidden or closed
  await expect(menu).toBeHidden();

  // Scroll position should have moved down to about section
  const scrollYAfterAbout = await page.evaluate(() => window.scrollY);
  console.log("ScrollY after clicking Tentang:", scrollYAfterAbout);
  expect(scrollYAfterAbout).toBeGreaterThan(200);

  // Test 3: Open menu again and click 'Hubungi'
  await burger.click();
  await page.waitForTimeout(500);
  await expect(menu).toBeVisible();

  const contactLink = page.locator('#menu a[href="#contact"]');
  await expect(contactLink).toBeVisible();
  await contactLink.click();
  await page.waitForTimeout(1500);

  await expect(menu).toBeHidden();
  const scrollYAfterContact = await page.evaluate(() => window.scrollY);
  console.log("ScrollY after clicking Hubungi:", scrollYAfterContact);
  expect(scrollYAfterContact).toBeGreaterThan(scrollYAfterAbout + 1000);

  // Test 4: Fast scroll up and down - navbar must remain visible and not disappear
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.scrollBy(0, -1500));
    await page.waitForTimeout(100);
  }

  // Check nav visibility and opacity
  const navStyle = await nav.evaluate((el) => {
    const s = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      opacity: parseFloat(s.opacity),
      visibility: s.visibility,
      top: rect.top,
      height: rect.height,
    };
  });
  console.log("Nav style after fast scroll:", navStyle);
  expect(navStyle.opacity).toBeGreaterThan(0.8);
  expect(navStyle.visibility).toBe("visible");
  expect(navStyle.top).toBeGreaterThanOrEqual(0);
});
