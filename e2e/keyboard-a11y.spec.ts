import { expect, test } from "@playwright/test";
import { expectNoA11yViolations, rows, waitForRows } from "./helpers";

test("slash focuses search and Escape closes popovers", async ({ page }) => {
  await page.goto("/payments");
  await waitForRows(page);
  const search = page.getByLabel(/Search by payment ID/);
  await expect(async () => {
    await page.keyboard.press("/");
    await expect(search).toBeFocused({ timeout: 250 });
  }).toPass();
  await expect(search).toHaveValue("");
  await page.keyboard.type("4242");
  await expect(page).toHaveURL(/q=4242/);

  const trigger = page.getByRole("button", { name: "Filter by currency" });
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Filter by currency" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Filter by currency" }),
  ).toBeHidden();
});

test("the skip link is the first tab stop and bypasses the sidebar", async ({
  page,
}) => {
  await page.goto("/payments");
  await waitForRows(page);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel(/Search by payment ID/)).toBeFocused();
});

test("amounts are the only tab stop in each row", async ({ page }) => {
  await page.goto("/payments");
  await waitForRows(page);
  const first = rows(page).first();
  await expect(first.locator('a[tabindex="0"]')).toHaveCount(1);
  await expect(first.locator('a[tabindex="0"]')).toHaveClass(/amount/);
});

test("details page has no accessibility violations", async ({ page }) => {
  await page.goto("/payments");
  await waitForRows(page);
  await rows(page).first().locator(".amount").click();
  await expect(page.locator(".loading-spinner")).toHaveCount(0);
  await expectNoA11yViolations(page);
});

test("open column settings have no accessibility violations", async ({
  page,
}) => {
  await page.goto("/payments");
  await waitForRows(page);
  await page.getByRole("button", { name: "Edit columns" }).click();
  await page.getByText("Column order and widths", { exact: true }).click();
  await expectNoA11yViolations(page);
});

test("mobile layout has no accessibility violations or page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/payments");
  await waitForRows(page);
  await expectNoA11yViolations(page);
  await page.getByLabel("Open workspace menu").click();
  await expect(
    page.getByRole("dialog", { name: "Workspace navigation" }),
  ).toBeVisible();
  await expectNoA11yViolations(page);
  await page.getByLabel("Close navigation").click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("company switcher opens below its trigger and shares the workspace with the mobile drawer", async ({
  page,
}) => {
  await page.goto("/payments");
  await waitForRows(page);
  const trigger = page.getByRole("button", {
    name: "Switch company, SpeedSEO",
  });
  const anchor = await trigger.boundingBox();
  await trigger.press("Enter");
  const panel = page.getByRole("dialog", { name: "Switch company, SpeedSEO" });
  await expect(
    panel.getByText("SpeedSEO sandbox", { exact: true }).first(),
  ).toBeVisible();
  const bounds = await panel.boundingBox();
  expect(bounds?.x).toBeCloseTo(anchor?.x ?? 0, 0);
  expect(bounds?.y).toBeCloseTo(
    (anchor?.y ?? 0) + (anchor?.height ?? 0) + 4,
    0,
  );
  await expectNoA11yViolations(page);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  const sandbox = panel.getByRole("button", { name: "Switch sandbox" });
  const flyout = page.getByRole("dialog", { name: "Switch sandbox" });
  // Sample immediately after the opening pointer event, before deferred toggle handlers run.
  const firstPosition = await sandbox.evaluate((row) => {
    row.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }),
    );
    const submenu = document.getElementById(row.getAttribute("aria-controls")!);
    const bounds = submenu?.getBoundingClientRect();
    const anchor = row.getBoundingClientRect();
    return {
      open: submenu?.matches(":popover-open"),
      rightGap: (bounds?.left ?? 0) - anchor.right,
      topOffset: (bounds?.top ?? 0) - anchor.top,
    };
  });
  expect(firstPosition.open).toBe(true);
  expect(firstPosition.rightGap).toBeCloseTo(4, 0);
  expect(firstPosition.topOffset).toBeCloseTo(0, 0);
  await sandbox.hover();
  await expect(flyout).toBeVisible();
  const rowBounds = await sandbox.boundingBox();
  const flyoutBounds = await flyout.boundingBox();
  expect(flyoutBounds?.x).toBeCloseTo(
    (rowBounds?.x ?? 0) + (rowBounds?.width ?? 0) + 4,
    0,
  );
  expect(flyoutBounds?.y).toBeCloseTo(rowBounds?.y ?? 0, 0);
  expect((await panel.boundingBox())?.height).toEqual(bounds?.height);
  await sandbox.press("ArrowRight");
  await expect(flyout.getByRole("button", { name: "Test mode" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(flyout).toBeHidden();
  await expect(sandbox).toBeFocused();
  await panel.getByRole("button", { name: "Other accounts" }).click();
  await panel.getByRole("button", { name: "cramly.ai", exact: true }).click();
  await expect(panel).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Open workspace menu").click();
  const drawer = page.getByRole("dialog", { name: "Workspace navigation" });
  await drawer
    .getByRole("button", { name: "Switch company, cramly.ai" })
    .click();
  await page.getByRole("button", { name: "Exit sandbox" }).click();
  await expect(drawer).toBeVisible();
  for (const name of ["Home", "Payments analytics", "Developers"]) {
    await expect(
      drawer.getByRole("button", { name, exact: true }),
    ).toBeEnabled();
  }
});
