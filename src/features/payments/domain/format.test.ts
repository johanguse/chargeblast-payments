import { describe, expect, it } from "vitest";
import {
  compactDateFormatter,
  formatDateTime,
  formatMoney,
  formatRelativeTime,
  roundFilterAmount,
} from "./format";

const MINUTE = 60_000;

describe("formatMoney", () => {
  it.each([
    [{ amount: 84, currency: "USD" }, "$84.00"],
    [{ amount: 1234.5, currency: "EUR" }, "€1,234.50"],
    [{ amount: 509, currency: "JPY" }, "¥509"],
    [{ amount: 9.99, currency: "CAD" }, "$9.99"],
    [{ amount: 1234.5, currency: "BRL" }, "R$ 1,234.50"],
  ])("%o → %s", (payment, expected) => {
    expect(formatMoney(payment)).toBe(expected);
  });
});

describe("formatRelativeTime", () => {
  it.each([
    [0, "Just now"],
    [30_000, "Just now"],
    [MINUTE, "1 minute ago"],
    [59 * MINUTE, "59 minutes ago"],
    [3 * 60 * MINUTE, "3 hours ago"],
    [2 * 1440 * MINUTE, "2 days ago"],
  ])("%i ms ago → %s", (age, expected) => {
    expect(formatRelativeTime(1_000_000_000_000 - age, 1_000_000_000_000)).toBe(
      expected,
    );
  });

  it("clamps future times to now", () => {
    expect(formatRelativeTime(2 * MINUTE, 0)).toBe("Just now");
  });
});

describe("dates respect the time zone", () => {
  const time = Date.UTC(2026, 10, 19, 23, 30);
  it("formatDateTime", () => {
    expect(formatDateTime(time, "UTC")).toBe("Nov 19, 2026, 11:30 PM");
    expect(formatDateTime(time, "Asia/Tokyo")).toBe("Nov 20, 2026, 8:30 AM");
  });
  it("compactDateFormatter", () => {
    expect(compactDateFormatter("America/Sao_Paulo").format(time)).toBe(
      "Nov 19, 8:30 PM",
    );
  });
});

describe("roundFilterAmount", () => {
  it.each([
    ["12.345", "12.35"],
    ["12.252665", "12.25"],
    ["1000", "1000"],
    ["", ""],
    ["abc", "abc"],
  ])("%s → %s", (input, expected) => {
    expect(roundFilterAmount(input)).toBe(expected);
  });
});
