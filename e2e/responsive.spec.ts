import { expect, test } from "@playwright/test";
import { rows, waitForRows } from "./helpers";

test.use({ hasTouch: true, isMobile: true });

test("the phone layout contains active filters and keeps row actions reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(
    "/payments?status=Failed&status=Succeeded&status=Pending&method=Card&method=Wallet",
  );
  await waitForRows(page);
  const status = page.getByRole("button", { name: "Filter by status" });
  await expect(status).toContainText("or Pending");
  for (const selector of [".payments-main", ".heading", ".pills"]) {
    const fits = await page
      .locator(selector)
      .evaluate((el) => el.scrollWidth <= el.clientWidth);
    expect(fits, selector).toBe(true);
  }
  await status.tap();
  const dialog = page.getByRole("dialog", { name: "Filter by status" });
  await expect(dialog).toBeInViewport({ ratio: 1 });
  await dialog.getByRole("button", { name: "Back" }).tap();
  const grid = page.getByRole("region", { name: "Payments table" });
  await grid.evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
  });
  const more = rows(page)
    .first()
    .getByRole("button", { name: /More actions/ });
  await more.tap();
  await expect(
    page.getByRole("dialog", { name: /More actions/ }),
  ).toBeInViewport({ ratio: 1 });
  await page.keyboard.press("Escape");
  await grid.evaluate((el) => {
    el.scrollLeft = 0;
  });
  await rows(page).first().locator(".amount").tap();
  const back = page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link");
  await expect(back).toBeInViewport();
  const heading = page.getByRole("heading", { name: "Details", exact: true });
  await expect(heading).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await back.tap();
  await expect(status).toContainText("or Pending");
});

test("tablet navigation uses the drawer and the dashboard fits without sideways scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/payments");
  await waitForRows(page);
  const menu = page.getByRole("button", { name: "Open workspace menu" });
  await menu.tap();
  await expect(
    page.getByRole("dialog", { name: "Workspace navigation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close navigation" }).tap();
  const table = page.getByRole("region", { name: "Payments table" });
  expect((await table.boundingBox())!.width).toBeGreaterThan(700);
  expect(
    await page
      .locator(".payments-main")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
});
