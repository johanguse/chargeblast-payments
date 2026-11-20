import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makePayment, NOW } from "@/test/fixtures";
import { defaultColumns, defaultWidths } from "../../domain/columns";
import type { Payment } from "../../domain/payment";
import { PaymentsTable } from "./payments-table";

const rows: Payment[] = [
  makePayment({ id: "pi_ok_1" }),
  makePayment({ id: "pi_ok_2", amount: 9 }),
  makePayment({
    id: "pi_fail",
    status: "Failed",
    declineReason: "Card declined",
  }),
];

function setup(props: Partial<Parameters<typeof PaymentsTable>[0]> = {}) {
  const handlers = {
    onSort: vi.fn(),
    onResize: vi.fn(),
    onMove: vi.fn(),
    announce: vi.fn(),
  };
  render(
    <PaymentsTable
      loading={false}
      pageSize={25}
      rows={rows}
      columns={[...defaultColumns]}
      widths={defaultWidths}
      wrap={false}
      params={new URLSearchParams("status=Succeeded")}
      now={NOW}
      {...handlers}
      {...props}
    />,
  );
  return { user: userEvent.setup(), ...handlers };
}

const bodyRows = () => screen.getAllByRole("row").slice(1);

describe("PaymentsTable", () => {
  it("renders one row per payment with its columns", () => {
    setup();
    expect(bodyRows()).toHaveLength(3);
    for (const column of defaultColumns)
      expect(
        screen.getByRole("columnheader", { name: column }),
      ).toBeInTheDocument();
    expect(
      within(bodyRows()[2]).getByText("Card declined"),
    ).toBeInTheDocument();
  });

  it("links cells to the details page with the list query", () => {
    setup();
    const link = within(bodyRows()[0]).getByRole("link", { name: /\$84\.00/ });
    const url = new URL(link.getAttribute("href")!, "http://x");
    expect(url.pathname).toBe("/payments/pi_ok_1");
    expect(url.searchParams.get("back")).toBe("?status=Succeeded");
    expect(url.searchParams.get("at")).toBe(String(NOW));
  });

  it("selects only succeeded payments with select-all", async () => {
    const { user } = setup();
    await user.click(screen.getByLabelText("Select all payments on this page"));
    expect(screen.getByLabelText("Select payment pi_ok_1")).toBeChecked();
    expect(screen.getByLabelText("Select payment pi_ok_2")).toBeChecked();
    expect(screen.getByLabelText("Select payment pi_fail")).toBeDisabled();
    expect(bodyRows()[0]).toHaveClass("selected");
    await user.click(screen.getByLabelText("Select payment pi_ok_1"));
    expect(
      screen.getByLabelText("Select all payments on this page"),
    ).not.toBeChecked();
  });

  it("only offers quick actions on succeeded payments", () => {
    setup();
    expect(
      within(bodyRows()[0]).getByLabelText("Refund payment"),
    ).toBeInTheDocument();
    expect(within(bodyRows()[2]).queryByLabelText("Refund payment")).toBeNull();
  });

  it("sorts sortable columns and marks the active one", async () => {
    const { user, onSort } = setup({
      params: new URLSearchParams("sort=Amount&dir=asc"),
    });
    expect(
      screen.getByRole("columnheader", { name: "Amount" }),
    ).toHaveAttribute("aria-sort", "ascending");
    await user.click(screen.getByRole("button", { name: "Status" }));
    expect(onSort).toHaveBeenCalledWith("Status");
    expect(
      within(
        screen.getByRole("columnheader", { name: "Customer" }),
      ).queryByRole("button"),
    ).toBeNull();
  });

  it("copies the payment ID and announces it", async () => {
    const { user, announce } = setup();
    await user.click(
      screen.getByRole("button", { name: "Copy payment ID pi_ok_1" }),
    );
    expect(await navigator.clipboard.readText()).toBe("pi_ok_1");
    expect(announce).toHaveBeenCalledWith("Payment ID copied");
  });

  it("announces when the clipboard is unavailable", async () => {
    const { user, announce } = setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("denied"),
    );
    await user.click(
      screen.getByRole("button", { name: "Copy payment ID pi_ok_1" }),
    );
    expect(announce).toHaveBeenCalledWith("Clipboard unavailable");
  });

  it("shows skeleton rows while loading", () => {
    setup({ loading: true, pageSize: 5 });
    expect(
      screen.getByRole("region", { name: "Payments table" }),
    ).toHaveAttribute("aria-busy", "true");
    expect(document.querySelectorAll(".skeleton-table tr")).toHaveLength(5);
    expect(
      screen.getByLabelText("Select all payments on this page"),
    ).toBeDisabled();
  });

  it("sizes the table from the column widths", () => {
    setup({ columns: ["Amount", "Status"] });
    expect(screen.getByRole("table")).toHaveStyle({
      width: `${26 + 40 + defaultWidths.Amount + defaultWidths.Status}px`,
    });
  });
});
