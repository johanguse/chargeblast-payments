import { describe, expect, it, vi } from "vitest";
import {
  parseSnapshotTime,
  paymentDetailsHref,
  paymentsListHref,
  resolveTimeZone,
} from "./routes";

describe("paymentDetailsHref", () => {
  it("carries the snapshot, time zone and list query", () => {
    const href = paymentDetailsHref("pi_1", {
      at: 123,
      timeZone: "Europe/Paris",
      listParams: new URLSearchParams("status=Failed&page=2"),
    });
    const url = new URL(href, "http://x");
    expect(url.pathname).toBe("/payments/pi_1");
    expect(url.searchParams.get("at")).toBe("123");
    expect(url.searchParams.get("tz")).toBe("Europe/Paris");
    expect(url.searchParams.get("back")).toBe("?status=Failed&page=2");
  });
});

describe("paymentsListHref", () => {
  it.each([
    [undefined, "/payments"],
    ["?status=Failed", "/payments?status=Failed"],
    ["https://evil.example", "/payments"],
    ["//evil.example", "/payments"],
  ])("%s → %s", (back, expected) => {
    expect(paymentsListHref(back)).toBe(expected);
  });
});

describe("parseSnapshotTime", () => {
  it("accepts a valid timestamp", () => {
    expect(parseSnapshotTime("1700000000000")).toBe(1_700_000_000_000);
  });

  it.each([undefined, "", "abc", "-1", "9e99"])(
    "falls back to now for %s",
    (at) => {
      vi.spyOn(Date, "now").mockReturnValue(42);
      expect(parseSnapshotTime(at)).toBe(42);
    },
  );
});

describe("resolveTimeZone", () => {
  it.each([
    [undefined, "UTC"],
    ["Not/AZone", "UTC"],
    ["America/New_York", "America/New_York"],
  ])("%s → %s", (tz, expected) => {
    expect(resolveTimeZone(tz)).toBe(expected);
  });
});
