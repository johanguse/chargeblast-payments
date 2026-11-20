import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { rows, waitForRows } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/payments");
  await waitForRows(page);
});

test("export contains exactly the filtered payments", async ({ page }) => {
  await page.getByRole("button", { name: "Refunded", exact: true }).click();
  await waitForRows(page);
  const total = Number(
    await page.locator(".result-range strong").textContent(),
  );

  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export current view as CSV" })
    .click();
  const csv = await readFile((await (await download).path())!, "utf8");
  const lines = csv.split("\r\n");

  expect(lines).toHaveLength(total + 1);
  expect(lines[0]).toContain('"Refunded date"');
  expect(lines.slice(1).every((line) => line.includes('"Refunded"'))).toBe(
    true,
  );
  await expect(
    page.getByRole("status").filter({ hasText: "exported" }),
  ).toHaveText(`${total} payments exported`);
});

test("select all only picks succeeded payments", async ({ page }) => {
  await page.getByLabel("Select all payments on this page").check();
  const selectable = page.locator('tbody tr[data-selectable="true"]');
  await expect(selectable.first()).toHaveClass(/selected/);
  await expect(
    page.locator('tbody tr[data-selectable="false"].selected'),
  ).toHaveCount(0);
  await expect(page.locator("tbody tr.selected")).toHaveCount(
    await selectable.count(),
  );
});

test("dragging a header edge resizes the column", async ({ page }) => {
  const header = page.getByRole("columnheader", { name: "Description" });
  const before = (await header.boundingBox())!.width;
  const handle = header.locator(".resize");
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  expect((await header.boundingBox())!.width).toBeCloseTo(before + 80, -1);
});

test("dragging a header reorders the columns", async ({ page }) => {
  await page
    .getByRole("columnheader", { name: "Customer" })
    .dragTo(page.getByRole("columnheader", { name: "Amount" }));
  await expect(page.locator("thead th").nth(1)).toHaveText("Customer");
});

test("optional columns can be shown and reset", async ({ page }) => {
  await page.getByRole("button", { name: "Edit columns" }).click();
  const settings = page.getByRole("dialog", { name: "Edit columns" });
  await settings.getByLabel("Customer name", { exact: true }).check();
  await expect(
    page.getByRole("columnheader", { name: "Customer name" }),
  ).toBeVisible();
  await settings.getByRole("button", { name: "Reset to default" }).click();
  await expect(
    page.getByRole("columnheader", { name: "Customer name" }),
  ).toHaveCount(0);
});

test("Analyze counts match the current filter and close on backdrop click", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Failed", exact: true }).click();
  await waitForRows(page);
  const total = await page.locator(".result-range strong").textContent();
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Analyze" });
  await expect(dialog.getByText(`${total} matching payments`)).toBeVisible();
  await expect(dialog.locator("dt:text-is('Failed') + dd")).toHaveText(total!);
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
});

test("sorting by amount flips direction", async ({ page }) => {
  const amount = page.getByRole("button", { name: "Amount", exact: true });
  const values = async () =>
    (await rows(page).locator(".amount-value").allTextContents()).map((v) =>
      Number(v.replace(/[^\d.]/g, "")),
    );
  await amount.click();
  await waitForRows(page);
  const asc = await values();
  await amount.click();
  await waitForRows(page);
  await expect(
    page.getByRole("columnheader", { name: "Amount" }),
  ).toHaveAttribute("aria-sort", "descending");
  const desc = await values();
  expect(Math.min(...asc)).toBeLessThanOrEqual(Math.min(...desc));
  expect(desc[0]).toBeGreaterThanOrEqual(desc.at(-1)!);
});
