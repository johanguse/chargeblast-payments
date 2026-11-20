import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { defaultColumns, defaultWidths } from "../domain/columns";
import { useColumnLayout } from "./use-column-layout";

describe("useColumnLayout", () => {
  it("shows only the default columns at first", () => {
    const { result } = renderHook(useColumnLayout);
    expect(result.current.visibleColumns).toEqual(defaultColumns);
    expect(result.current.wrap).toBe(false);
  });

  it("shows, hides, moves and resizes columns", () => {
    const { result } = renderHook(useColumnLayout);
    act(() => result.current.setVisible("Wallet", true));
    act(() => result.current.setVisible("Description", false));
    act(() => result.current.move("Status", "Amount"));
    act(() => result.current.resize("Amount", 10));
    const { visibleColumns, widths } = result.current;
    expect(visibleColumns).toContain("Wallet");
    expect(visibleColumns).not.toContain("Description");
    expect(visibleColumns.slice(0, 2)).toEqual(["Status", "Amount"]);
    expect(widths.Amount).toBe(75);
  });

  it("reset restores every default", () => {
    const { result } = renderHook(useColumnLayout);
    act(() => {
      result.current.setVisible("Wallet", true);
      result.current.setWrap(true);
      result.current.move("Status", "Amount");
      result.current.resize("Amount", 300);
    });
    act(() => result.current.reset());
    expect(result.current.visibleColumns).toEqual(defaultColumns);
    expect(result.current.widths).toEqual(defaultWidths);
    expect(result.current.wrap).toBe(false);
  });
});
