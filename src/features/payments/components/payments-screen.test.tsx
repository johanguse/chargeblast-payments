import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NOW, payments } from "@/test/fixtures";
import { PaymentsScreen } from "./payments-screen";

const table = () => screen.getByRole("region", { name: "Payments table" });
const dataRows = () => within(table()).queryAllByRole("row").slice(1);

async function renderScreen(url = "/payments") {
  history.replaceState(null, "", url);
  render(<PaymentsScreen now={NOW} data={payments} />);
  await screen.findByText(/results/);
  return userEvent.setup();
}

describe("PaymentsScreen", () => {
  it("shows the first page of payments", async () => {
    await renderScreen();
    expect(dataRows()).toHaveLength(25);
    expect(screen.getByRole("combobox", { name: "Rows per page" })).toHaveValue(
      "25",
    );
    expect(screen.getByText(/Viewing 1–25/)).toBeVisible();
  });

  it("filters with the status tabs and reflects it in the URL", async () => {
    const user = await renderScreen();
    await user.click(screen.getByRole("button", { name: "Failed" }));
    expect(location.search).toBe("?status=Failed");
    expect(screen.getByRole("button", { name: "Failed" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await vi.waitFor(() =>
      expect(dataRows().every((r) => r.textContent?.includes("Failed"))).toBe(
        true,
      ),
    );
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(location.search).toBe("");
  });

  it("restores filters from the URL", async () => {
    await renderScreen("/payments?q=nothing-matches");
    expect(screen.getByLabelText(/Search by payment ID/)).toHaveValue(
      "nothing-matches",
    );
    expect(
      screen.getByRole("heading", { name: "No payments found" }),
    ).toBeInTheDocument();
  });

  it("clears search and filters from the empty state", async () => {
    const user = await renderScreen(
      "/payments?q=nothing-matches&status=Failed&sort=Amount",
    );
    await user.click(
      screen.getByRole("button", { name: "Clear search and filters" }),
    );
    expect(location.search).toBe("?sort=Amount");
  });

  it("focuses search with the / shortcut", async () => {
    const user = await renderScreen();
    await user.keyboard("/");
    expect(screen.getByLabelText(/Search by payment ID/)).toHaveFocus();
  });

  it("sorts by a header and resets to page one", async () => {
    const user = await renderScreen("/payments?page=2");
    await user.click(screen.getByRole("button", { name: "Amount" }));
    expect(location.search).toBe("?dir=asc&sort=Amount");
  });

  it("pages forward without losing other params", async () => {
    const user = await renderScreen("/payments?status=Succeeded");
    await user.click(screen.getByLabelText("Next page"));
    expect(new URLSearchParams(location.search).get("page")).toBe("2");
    expect(new URLSearchParams(location.search).get("status")).toBe(
      "Succeeded",
    );
  });

  it("exports the filtered result as CSV", async () => {
    const createObjectURL = vi.fn(() => "blob:csv");
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const user = await renderScreen("/payments?status=Refunded");
    await user.click(screen.getByLabelText("Export current view as CSV"));
    const refunded = payments.filter((p) => p.status === "Refunded").length;
    expect(click).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(screen.getByText(`${refunded} payments exported`)).toHaveClass(
      "toast",
    );
  });

  it("dismisses the announcement and moves focus to the status tabs", async () => {
    const user = await renderScreen();
    await user.click(screen.getByLabelText("Dismiss announcement"));
    expect(screen.queryByText(/Rule Attributes/)).toBeNull();
    expect(screen.getByRole("button", { name: "All" })).toHaveFocus();
  });

  it("renders an inert skeleton while the first load streams in", () => {
    render(<PaymentsScreen now={NOW} data={[]} loading />);
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(document.querySelector(".skeleton-table")).not.toBeNull();
    expect(screen.queryByText("No payments found")).toBeNull();
  });
});
