import { describe, expect, it } from "vitest";
import { makePayment } from "@/test/fixtures";
import { paymentsToCsv } from "./csv";

describe("paymentsToCsv", () => {
  it("writes a header and one CRLF-separated row per payment", () => {
    const lines = paymentsToCsv([
      makePayment(),
      makePayment({ id: "pi_2" }),
    ]).split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatch(/^"Amount","Status","Payment method"/);
  });

  it("formats values and leaves optional dates blank", () => {
    const [, row] = paymentsToCsv([makePayment()]).split("\r\n");
    expect(row).toContain('"$84.00 USD"');
    expect(row).toContain('"Visa 4242"');
    expect(row.endsWith(',"",""')).toBe(true);
  });

  it("escapes quotes so values cannot break columns", () => {
    const [, row] = paymentsToCsv([
      makePayment({ description: 'Plan "Pro", yearly' }),
    ]).split("\r\n");
    expect(row).toContain('"Plan ""Pro"", yearly"');
  });

  it("writes ISO refund dates and decline reasons", () => {
    const [, row] = paymentsToCsv([
      makePayment({
        status: "Refunded",
        refundedAt: Date.UTC(2026, 0, 2),
        declineReason: "x",
      }),
    ]).split("\r\n");
    expect(row).toContain('"2026-01-02T00:00:00.000Z","x"');
  });

  it("returns only the header for no payments", () => {
    expect(paymentsToCsv([]).split("\r\n")).toHaveLength(1);
  });
});
