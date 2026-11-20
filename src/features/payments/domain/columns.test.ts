import { describe, expect, it } from "vitest";
import {
  availableColumns,
  clampColumnWidth,
  defaultWidths,
  isSortable,
  MAX_COLUMN_WIDTH,
  moveColumn,
} from "./columns";

describe("moveColumn", () => {
  const order = [...availableColumns];

  it("moves a column right into the target's slot", () => {
    const next = moveColumn(order, "Amount", "Description");
    expect(next.indexOf("Amount")).toBe(order.indexOf("Description"));
    expect(next).toHaveLength(order.length);
  });

  it("moves a column left into the target's slot", () => {
    const next = moveColumn(order, "Payment ID", "Amount");
    expect(next[0]).toBe("Payment ID");
    expect(next[1]).toBe("Amount");
  });

  it("returns the same array when dropping on itself", () => {
    expect(moveColumn(order, "Amount", "Amount")).toBe(order);
  });

  it("does not mutate its input", () => {
    const copy = [...order];
    moveColumn(order, "Amount", "Status");
    expect(order).toEqual(copy);
  });
});

describe("clampColumnWidth", () => {
  it.each([
    ["Amount", 10, 75],
    ["Amount", 200, 200],
    ["Amount", 9999, MAX_COLUMN_WIDTH],
    ["Payment ID", 100, 160],
  ] as const)("%s at %i → %i", (column, width, expected) => {
    expect(clampColumnWidth(column, width)).toBe(expected);
  });
});

it("every column has a default width within the limits", () => {
  for (const c of availableColumns) {
    expect(clampColumnWidth(c, defaultWidths[c])).toBe(defaultWidths[c]);
  }
});

it("only Amount, Status and Date are sortable", () => {
  expect(availableColumns.filter(isSortable)).toEqual([
    "Amount",
    "Status",
    "Date",
  ]);
});
