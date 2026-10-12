import { test, expect } from "@playwright/test";

test("Fast scroll to surface immediately hides diver and fish food", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1000);

  // 1. Scroll down into Deep Sea (#deep)
  await page.evaluate(() => {
    const deep = document.querySelector("#deep");
    if (deep) deep.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(1500);

  // Verify Buddy diver is visible underwater
  const buddyStateUnderwater = await page.evaluate(() => {
    const bd = document.querySelector("#buddy") as HTMLElement;
    const pet = document.querySelector("#bdPet") as HTMLElement;
    return {
      bdOpacity: parseFloat(window.getComputedStyle(bd).opacity),
      bdVis: window.getComputedStyle(bd).visibility,
      petVis: window.getComputedStyle(pet).visibility,
    };
  });
  console.log("Underwater state:", buddyStateUnderwater);
  expect(buddyStateUnderwater.bdOpacity).toBeGreaterThan(0.5);
  expect(buddyStateUnderwater.bdVis).toBe("visible");

  // Click on deep to trigger pellets/feeding
  await page.evaluate(() => {
    const deep = document.querySelector("#deep");
    if (deep) {
      deep.dispatchEvent(new PointerEvent("pointerdown", { clientX: 400, clientY: 500 }));
      deep.dispatchEvent(new PointerEvent("pointerup", { clientX: 400, clientY: 500 }));
    }
  });
  await page.waitForTimeout(200);

  // 2. Fast scroll back to surface / land (0px)
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(100);

  // 3. Verify Buddy diver and Pet are immediately hidden on land
  const buddyStateLand = await page.evaluate(() => {
    const bd = document.querySelector("#buddy") as HTMLElement;
    const pet = document.querySelector("#bdPet") as HTMLElement;
    const say = document.querySelector("#bdSay") as HTMLElement;
    return {
      bdOpacity: parseFloat(window.getComputedStyle(bd).opacity),
      bdVis: window.getComputedStyle(bd).visibility,
      petVis: window.getComputedStyle(pet).visibility,
      sayOpacity: parseFloat(window.getComputedStyle(say).opacity),
    };
  });
  console.log("Land state (instant scroll):", buddyStateLand);
  expect(buddyStateLand.bdOpacity).toBe(0);
  expect(buddyStateLand.bdVis).toBe("hidden");
  expect(buddyStateLand.petVis).toBe("hidden");
  expect(buddyStateLand.sayOpacity).toBe(0);
});
