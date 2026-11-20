import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("payment workflow and accessible controls", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("tbody tr[data-selectable]")).toHaveCount(25);
  await expect(
    page.getByRole("heading", { name: "Transactions" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Dismiss announcement" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Payment status" }).getByRole("button"),
  ).toHaveCount(6);
  await expect(page.locator(".pills .pill")).toHaveCount(6);
  await expect(
    page.getByRole("button", { name: "Edit columns" }),
  ).toBeVisible();
  expect(
    (await page.locator("tbody tr").first().boundingBox())?.height,
  ).toBeCloseTo(37.375, 1);
  const scan = () =>
    new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
  expect((await scan()).violations.map((v) => v.id)).toEqual([]);
  await page.getByLabel("Next page").click();
  await expect(
    page.getByRole("button", { name: "Rows per page: 25" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rows per page: 25" }).click();
  await page.getByRole("button", { name: "100 rows" }).click();
  await expect(page.locator("tbody tr[data-selectable]")).toHaveCount(100);
  await page
    .getByRole("button", { name: "Filter by status", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Pending", { exact: true }).check();
  await dialog.getByRole("button", { name: "Apply", exact: true }).click();
  await page
    .getByRole("button", { name: "Filter by payment method", exact: true })
    .click();
  await dialog.getByLabel("Card", { exact: true }).check();
  expect((await scan()).violations.map((v) => v.id)).toEqual([]);
  await dialog.getByRole("button", { name: "Apply", exact: true }).click();
  await page.reload();
  await expect(page.locator("tbody tr").first()).toContainText("Pending");
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByRole("button", { name: "Amount", exact: true }).click();
  await expect(
    page.getByRole("columnheader", { name: "Amount" }),
  ).toHaveAttribute("aria-sort", "ascending");
  await page.getByLabel("Search by payment").fill("4149");
  await expect(page.locator("tbody tr").first()).toContainText("4149");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const copy = page.getByRole("button", { name: /Copy payment ID/ }).first(),
    id = (await copy.getAttribute("aria-label"))!.split(" ").pop();
  await copy.click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(id);
  await page.locator("tbody .amount").first().click();
  await expect(
    page.getByRole("heading", { name: "Recent activity" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Transactions" })
    .click();
  await page.getByRole("button", { name: "Edit columns" }).click();
  await page.getByText("Column order and widths", { exact: true }).click();
  await page.getByLabel("Move Status left").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("thead th").nth(1)).toContainText("Status");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export current view as CSV" })
    .click();
  expect((await download).suggestedFilename()).toBe("payments.csv");
  await page.getByLabel("Search by payment").fill("nothing-matches");
  await expect(page.getByText("No payments found")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("row links and pinned actions work on small screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?q=4149");
  await expect(page).toHaveURL(/payments\?q=4149$/);
  const row = page.locator("tbody tr").first(),
    more = row.getByRole("button", { name: /More actions/ });
  const before = await more.boundingBox();
  await page.locator(".gridscroll").evaluate((el) => (el.scrollLeft = 500));
  expect((await more.boundingBox())!.x).toBeCloseTo(before!.x, 0);
  await more.click();
  await expect(
    page.getByRole("dialog").getByText("Copy payment ID"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await row.getByText("Subscription update").click();
  await expect(page).toHaveURL(/payments\/pi_/);
  await page.getByLabel("Open workspace menu").click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Transactions" })
    .click();
  await expect(page).toHaveURL(/payments$/);
});

test("row actions stay compact unless a selectable payment is hovered or focused", async ({
  page,
}) => {
  await page.goto("/payments");
  const row = page.locator('tbody tr[data-selectable="true"]').first();
  const disabled = page.locator('tbody tr[data-selectable="false"]').first();
  const quick = row.locator(".quick"),
    dots = row.getByRole("button", { name: /More actions/ });
  await expect(dots).toBeVisible();
  await expect(quick.first()).toBeHidden();
  await row.locator(".amount").hover();
  await expect(quick.first()).toBeVisible();
  await expect(quick.last()).toHaveAccessibleName("Send receipt");
  await disabled.locator(".amount").hover();
  await expect(quick.first()).toBeHidden();
  await expect(disabled.locator(".quick")).toHaveCount(0);
  await dots.focus();
  await expect(quick.first()).toBeVisible();
  await disabled.getByRole("button", { name: /More actions/ }).click();
  await expect(
    page.getByRole("dialog").getByRole("button", { name: "Copy payment ID" }),
  ).toBeVisible();
});

test("date tooltip clears the sticky header and supports keyboard navigation", async ({
  page,
}) => {
  await page.goto("/payments");
  const dates = page.locator("tbody a:has(time)");
  const bubble = page.locator(".date-tooltip");
  await dates.first().hover();
  await expect(bubble).toBeVisible();
  await expect(page.getByRole("tooltip")).toHaveText("Just now");
  expect(
    await bubble.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return el.contains(
        document.elementFromPoint(
          box.x + box.width / 2,
          box.y + box.height / 2,
        ),
      );
    }),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(bubble).toBeHidden();
  await page.mouse.move(0, 0);
  await dates.nth(1).focus();
  await expect(dates.nth(1)).toHaveAccessibleDescription("1 minute ago");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/payments\/pi_/);
});

test("payments stream table rows and detail sections in stages", async ({
  page,
}) => {
  await page.goto("/payments", { waitUntil: "commit" });
  await expect(page.locator(".skeleton-table")).toBeVisible();
  const first = page.locator("tbody .amount").first();
  await expect(first).toBeVisible();
  const href = await first.getAttribute("href");
  await page.goto(href!, { waitUntil: "commit" });
  await expect(page.locator(".detail-loading")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
  await expect(
    page.locator(".payment-rail .loading-spinner").last(),
  ).toBeVisible();
  await expect(page.locator(".payment-rail")).toContainText("Sandbox");
  await expect(page.locator(".loading-spinner")).toHaveCount(0);
});

test("amount popover applies a range and Back discards edits", async ({
  page,
}) => {
  await page.goto("/payments");
  const trigger = page.getByRole("button", {
    name: "Filter by amount",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Filter by amount" });
  await dialog.getByLabel("Filter value").fill("5.25");
  await expect(trigger).toContainText("= 5.25");
  await dialog.getByRole("button", { name: "Back" }).click();
  await expect(trigger).toBeFocused();
  await expect(trigger).not.toContainText("5.25");
  await expect(page).toHaveURL(/payments$/);
  await trigger.click();
  await expect(dialog.getByLabel("Filter value")).toHaveValue("");
  await dialog.getByLabel("Number filter select").selectOption("between");
  await dialog.getByLabel("Minimum").fill("9.88");
  await dialog.getByLabel("Maximum").fill("21.98");
  await expect(trigger).toContainText("9.88 – 21.98");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/min=9.88/);
  await expect(page).toHaveURL(/max=21.98/);
});

test("rounded bounds, full IDs and configurable columns", async ({ page }) => {
  await page.goto("/payments");
  const idButton = page
    .getByRole("button", { name: /Copy payment ID/ })
    .first();
  const fullId = (await idButton.getAttribute("aria-label"))!.replace(
    "Copy payment ID ",
    "",
  );
  await expect(idButton).toHaveText(fullId);
  await page.getByRole("button", { name: "Edit columns" }).click();
  const settings = page.getByRole("dialog");
  await settings.getByLabel("Description", { exact: true }).uncheck();
  await settings.getByRole("switch", { name: "Wrap cells" }).check();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("columnheader", { name: "Description" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Analyze payments" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const createPayment = page.getByRole("button", {
    name: "Create payment",
    exact: true,
  });
  await expect(createPayment).toBeEnabled();
  await createPayment.click();
  await expect(page).toHaveURL(/\/payments$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  for (const name of ["Help", "Notifications", "Settings", "Create"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeEnabled();
  }
  await page.getByRole("button", { name: "Filter by amount" }).click();
  await page.getByLabel("Filter value").fill("12.252665");
  await expect(
    page.getByRole("button", { name: "Filter by amount" }),
  ).toContainText("12.25");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page).toHaveURL(/min=12\.25&max=12\.25$/);
});

test("committed filters and pagination refresh only the payment rows", async ({
  page,
}) => {
  await page.goto("/payments");
  const grid = page.getByRole("region", { name: "Payments table" });
  const skeleton = grid.locator(".skeleton-table");
  const rows = grid.locator("tr[data-selectable]");
  const statusFilter = page.getByRole("button", { name: "Filter by status" });
  await expect(rows).toHaveCount(25);
  await statusFilter.click();
  await page.getByLabel("Pending", { exact: true }).check();
  await expect(skeleton).toBeHidden();
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(skeleton).toBeVisible();
  await expect(statusFilter).toBeFocused();
  await expect(rows.first()).toContainText("Pending");

  await page.getByRole("button", { name: "Clear Status filter" }).click();
  await expect(skeleton).toBeVisible();
  await expect(rows.first()).toContainText("Failed");

  const firstId = await rows
    .first()
    .getByRole("button", { name: /Copy payment ID/ })
    .textContent();
  await page.getByLabel("Next page").click();
  await expect(skeleton).toBeVisible();
  await expect(
    grid.getByRole("columnheader", { name: "Amount" }),
  ).toBeVisible();
  await expect(rows).toHaveCount(25);
  await expect(rows.first()).not.toContainText(firstId!);
  await page.getByLabel("Previous page").click();
  await expect(skeleton).toBeVisible();
  await expect(rows.first()).toContainText(firstId!);

  await page.getByRole("button", { name: "Rows per page: 25" }).click();
  await page.getByRole("button", { name: "50 rows" }).click();
  await expect(skeleton.locator("tr")).toHaveCount(50);
  await expect(rows).toHaveCount(50);
});
