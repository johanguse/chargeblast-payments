import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const rows = (page: Page) =>
  page
    .getByRole("region", { name: "Payments table" })
    .locator("tbody tr[data-selectable]");

/** Waits for the list to finish its simulated request. */
export async function waitForRows(page: Page) {
  await expect(page.locator(".skeleton-table")).toHaveCount(0);
  await expect(rows(page).first()).toBeVisible();
}

export async function expectNoA11yViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

export async function applyStatusFilter(page: Page, status: string) {
  await page
    .getByRole("button", { name: "Filter by status", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Filter by status" });
  await dialog.getByLabel(status, { exact: true }).check();
  await dialog.getByRole("button", { name: "Apply", exact: true }).click();
  await waitForRows(page);
}
