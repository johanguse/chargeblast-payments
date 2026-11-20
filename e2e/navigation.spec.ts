import { expect, type Page, test } from "@playwright/test";
import { applyStatusFilter, rows, waitForRows } from "./helpers";

const breadcrumb = (page: Page) =>
  page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link");

test("details page returns to the same filtered, sorted page", async ({
  page,
}) => {
  await page.goto("/payments?sort=Amount&dir=asc");
  await waitForRows(page);
  await applyStatusFilter(page, "Succeeded");
  await page.getByLabel("Next page").click();
  await waitForRows(page);
  const listUrl = page.url();
  const amount = await rows(page)
    .first()
    .locator(".amount-value")
    .textContent();

  await rows(page).first().locator(".amount").click();
  await expect(page).toHaveURL(/\/payments\/pi_/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(amount!);
  await expect(page.locator(".payment-heading .badge")).toHaveText("Succeeded");

  await breadcrumb(page).click();
  await expect(page).toHaveURL(listUrl);
  await waitForRows(page);
  await expect(
    page.getByRole("button", { name: "Filter by status" }),
  ).toContainText("Succeeded");
  await expect(
    page.getByRole("columnheader", { name: "Amount" }),
  ).toHaveAttribute("aria-sort", "ascending");
  await expect(page.locator(".result-range")).toContainText("26–50");
});

test("a shared link opens the same view", async ({ page }) => {
  await page.goto("/?status=Failed&method=Card&size=50");
  await expect(page).toHaveURL(
    /\/payments\?status=Failed&method=Card&size=50$/,
  );
  await waitForRows(page);
  await expect(
    page.getByRole("button", { name: "Failed", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const text of await rows(page).allTextContents())
    expect(text).toContain("Failed");
});

test("an unknown payment shows not found", async ({ page }) => {
  await page.goto("/payments/pi_does_not_exist");
  await expect(page.getByText(/could not be found/i)).toBeVisible();
});

test("details fall back to UTC and ignore off-site back links", async ({
  page,
}) => {
  await page.goto("/payments");
  await waitForRows(page);
  const href = await rows(page).first().locator(".amount").getAttribute("href");
  const url = new URL(href!, page.url());
  url.searchParams.set("tz", "Not/AZone");
  url.searchParams.set("back", "https://example.com");
  await page.goto(url.toString());
  await expect(
    page.getByRole("heading", { name: "Recent activity" }),
  ).toBeVisible();
  await expect(breadcrumb(page)).toHaveAttribute("href", "/payments");
});

test("transaction links scroll horizontally and select a shareable view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/payments");
  await waitForRows(page);
  const nav = page.getByRole("navigation", { name: "Transaction types" });
  await expect(nav.getByRole("link")).toHaveCount(6);
  expect(
    await nav.evaluate(
      (el) =>
        el.scrollHeight === el.clientHeight && el.scrollWidth > el.clientWidth,
    ),
  ).toBe(true);
  const payouts = nav.getByRole("link", { name: "Payouts" });
  await payouts.hover();
  await expect(payouts).toHaveCSS("background-color", "rgb(244, 247, 250)");
  await payouts.press("Enter");
  await expect(payouts).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("heading", { name: "No payouts in this sandbox" }),
  ).toBeVisible();
  await page.reload();
  await expect(payouts).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "All activity" }).click();
  await waitForRows(page);
  await nav.getByRole("link", { name: "Payments", exact: true }).click();
  await expect(page).toHaveURL(/\/payments$/);
});
