import { describe, expect, it } from "vitest";
import { formData } from "@/test/fixtures";
import {
  clearFilterGroup,
  filterGroups,
  filterValuesFromForm,
  summarizeFilter,
  validateFilterForm,
} from "./filters";

const group = (label: string) => filterGroups.find((g) => g.label === label)!;
const params = (search: string) => new URLSearchParams(search);

describe("summarizeFilter", () => {
  const amount = group("Amount");
  it.each([
    ["", ""],
    ["op=eq&min=5&max=5", "is equal to 5"],
    ["op=between&min=5&max=10", "is between 5 and 10"],
    ["op=between&min=5", "is at least 5"],
    ["op=between&max=10", "is at most 10"],
    ["op=gt&min=5", "is greater than 5"],
    ["op=lt&max=10", "is less than 10"],
  ])("amount %s → %s", (search, expected) => {
    expect(summarizeFilter(amount, params(search))).toBe(expected);
  });

  it("summarizes custom dates", () => {
    const date = group("Date and time");
    expect(
      summarizeFilter(
        date,
        params("range=Custom&from=2026-01-01&to=2026-01-31"),
      ),
    ).toBe("is from 2026-01-01 to 2026-01-31");
    expect(summarizeFilter(date, params("range=Custom"))).toBe(
      "is a custom range",
    );
    expect(summarizeFilter(date, params("range=7+days"))).toBe(
      "is in the last 7 days",
    );
  });

  it.each([
    ["Date and time", "range=Today", "is today"],
    [
      "Date and time",
      "range=Custom&to=2026-01-31",
      "is on or before 2026-01-31",
    ],
    [
      "Date and time",
      "range=Custom&from=2026-01-01",
      "is on or after 2026-01-01",
    ],
    ["Payment method", "method=Card&method=Wallet", "is Card or Wallet"],
    ["Currency", "currency=USD", "is USD"],
    ["More filters", "q=4242", "matching “4242”"],
  ])("%s describes %s", (label, search, expected) => {
    expect(summarizeFilter(group(label), params(search))).toBe(expected);
  });

  it("joins multi-select values", () => {
    expect(
      summarizeFilter(group("Status"), params("status=Failed&status=Pending")),
    ).toBe("is Failed or Pending");
  });
});

describe("filterValuesFromForm", () => {
  it("rounds amounts and mirrors equal-to into max", () => {
    const values = filterValuesFromForm(
      formData([
        ["op", "eq"],
        ["min", "12.345"],
      ]),
    );
    expect(values.toString()).toBe("op=eq&min=12.35&max=12.35");
  });

  it("drops blank values and an operator without amounts", () => {
    const values = filterValuesFromForm(
      formData([
        ["op", "gt"],
        ["min", "  "],
      ]),
    );
    expect(values.toString()).toBe("");
  });

  it("keeps repeated checkbox values", () => {
    const values = filterValuesFromForm(
      formData([
        ["status", "Failed"],
        ["status", "Pending"],
      ]),
    );
    expect(values.getAll("status")).toEqual(["Failed", "Pending"]);
  });

  it("trims search text", () => {
    expect(filterValuesFromForm(formData([["q", "  4242 "]])).get("q")).toBe(
      "4242",
    );
  });
});

describe("validateFilterForm", () => {
  it("rejects a max below the min", () => {
    expect(
      validateFilterForm(
        group("Amount"),
        formData([
          ["op", "between"],
          ["min", "10"],
          ["max", "5"],
        ]),
      ),
    ).toMatch(/Maximum must be at least/);
  });

  it("compares rounded amounts", () => {
    expect(
      validateFilterForm(
        group("Amount"),
        formData([
          ["op", "between"],
          ["min", "5.001"],
          ["max", "5"],
        ]),
      ),
    ).toBeNull();
  });

  it("rejects an end date before the start date", () => {
    expect(
      validateFilterForm(
        group("Date and time"),
        formData([
          ["range", "Custom"],
          ["from", "2026-02-01"],
          ["to", "2026-01-01"],
        ]),
      ),
    ).toMatch(/End date/);
  });

  it("accepts groups without rules", () => {
    expect(validateFilterForm(group("Status"), formData([]))).toBeNull();
  });
});

it("clearFilterGroup only removes that group's keys", () => {
  const p = params("op=eq&min=5&max=5&status=Failed");
  clearFilterGroup(group("Amount"), p);
  expect(p.toString()).toBe("status=Failed");
});
