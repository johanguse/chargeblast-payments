import { describe, expect, it } from "vitest";
import { NOW, payments } from "@/test/fixtures";
import {
  clearFilters,
  filterPayments,
  hasActiveFilters,
  paginate,
  queryPayments,
  readSort,
  toggleSort,
} from "./query";

const query = (search: string) =>
  queryPayments([...payments], new URLSearchParams(search), NOW);

const localDate = (time: number) => {
  const d = new Date(time);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

describe("filterPayments", () => {
  it("returns everything without params", () => {
    expect(filterPayments(payments, new URLSearchParams(), NOW)).toHaveLength(
      payments.length,
    );
  });

  it("combines status, method and amount filters", () => {
    const rows = query(
      "status=Succeeded&status=Refunded&method=Card&min=9&max=84",
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const p of rows) {
      expect(["Succeeded", "Refunded"]).toContain(p.status);
      expect(p.method).toBe("Card");
      expect(p.amount).toBeGreaterThanOrEqual(9);
      expect(p.amount).toBeLessThanOrEqual(84);
    }
  });

  it("filters by currency", () => {
    const rows = query("currency=EUR&currency=GBP");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((p) => ["EUR", "GBP"].includes(p.currency))).toBe(true);
  });

  it("treats gt and lt as strict bounds", () => {
    expect(query("op=gt&min=84").every((p) => p.amount > 84)).toBe(true);
    expect(query("op=lt&max=84").every((p) => p.amount < 84)).toBe(true);
  });

  it("ignores a lt operator without a max instead of hiding everything", () => {
    expect(query("op=lt")).toHaveLength(payments.length);
  });

  it.each([
    ["full ID", payments[0].id],
    ["email", payments[0].email],
    ["last four", payments[0].last4],
    ["upper-case ID", payments[0].id.toUpperCase()],
    ["padded ID", `  ${payments[0].id}  `],
  ])("searches by %s", (_, value) => {
    expect(
      query(`q=${encodeURIComponent(value)}`).some(
        (p) => p.id === payments[0].id,
      ),
    ).toBe(true);
  });

  it("returns nothing for an unknown search", () => {
    expect(query("q=nothing-matches")).toEqual([]);
  });

  it("widens results as the date preset grows", () => {
    const today = query("range=Today");
    expect(today.length).toBeGreaterThan(0);
    expect(query("range=7+days").length).toBeGreaterThanOrEqual(today.length);
    expect(query("range=30+days").length).toBeGreaterThanOrEqual(
      query("range=7+days").length,
    );
  });

  it("includes the whole end day of a custom range", () => {
    const day = localDate(NOW);
    expect(query(`range=Custom&from=${day}&to=${day}`)).toEqual(
      query("range=Today"),
    );
  });

  it("ignores unknown range presets", () => {
    expect(query("range=Forever")).toHaveLength(payments.length);
  });
});

describe("sorting", () => {
  it("defaults to newest first", () => {
    const rows = query("");
    for (let i = 1; i < rows.length; i++)
      expect(rows[i - 1].created).toBeGreaterThanOrEqual(rows[i].created);
  });

  it("sorts by amount ascending", () => {
    const rows = query("sort=Amount&dir=asc");
    for (let i = 1; i < rows.length; i++)
      expect(rows[i - 1].amount).toBeLessThanOrEqual(rows[i].amount);
  });

  it("sorts by status descending", () => {
    const rows = query("sort=Status&dir=desc");
    for (let i = 1; i < rows.length; i++)
      expect(
        rows[i - 1].status.localeCompare(rows[i].status),
      ).toBeGreaterThanOrEqual(0);
  });

  it("breaks ties by ID so the order is stable", () => {
    expect(query("sort=Amount")).toEqual(query("sort=Amount"));
  });

  it("toggleSort starts ascending and flips on the active column", () => {
    const p = new URLSearchParams();
    toggleSort(p, "Amount");
    expect(readSort(p)).toEqual({ column: "Amount", ascending: true });
    toggleSort(p, "Amount");
    expect(readSort(p)).toEqual({ column: "Amount", ascending: false });
    toggleSort(p, "Status");
    expect(readSort(p)).toEqual({ column: "Status", ascending: true });
  });

  it("readSort defaults to Date descending", () => {
    expect(readSort(new URLSearchParams())).toEqual({
      column: "Date",
      ascending: false,
    });
  });
});

describe("paginate", () => {
  const rows = Array.from({ length: 60 }, (_, i) => i);
  const page = (search: string) => paginate(rows, new URLSearchParams(search));

  it("starts on page one with 25 rows", () => {
    expect(page("")).toMatchObject({
      page: 1,
      pages: 3,
      size: 25,
      start: 0,
      end: 25,
    });
  });

  it("accepts the supported page sizes only", () => {
    expect(page("size=50").size).toBe(50);
    expect(page("size=7").size).toBe(25);
  });

  it.each([
    ["99", 3],
    ["0", 1],
    ["-4", 1],
    ["abc", 1],
    ["2.7", 2],
  ])("clamps page=%s to %i", (value, expected) => {
    expect(page(`page=${value}`).page).toBe(expected);
  });

  it("returns the last partial page", () => {
    expect(page("page=3").rows).toEqual(rows.slice(50));
    expect(page("page=3").end).toBe(60);
  });

  it("has one empty page for no rows", () => {
    expect(paginate([], new URLSearchParams())).toMatchObject({
      page: 1,
      pages: 1,
      rows: [],
    });
  });
});

describe("clearFilters", () => {
  it("removes filters and search but keeps sort and page size", () => {
    const p = new URLSearchParams("status=Failed&q=abc&sort=Amount&size=50");
    expect(hasActiveFilters(p)).toBe(true);
    clearFilters(p);
    expect(hasActiveFilters(p)).toBe(false);
    expect(p.toString()).toBe("sort=Amount&size=50");
  });
});
