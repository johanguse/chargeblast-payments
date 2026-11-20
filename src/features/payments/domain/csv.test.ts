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
    expect(lines[0]).toMatch(/^\uFEFF"Amount","Status","Payment method"/);
  });

  it("formats values and leaves optional dates blank", () => {
    const [, row] = paymentsToCsv([makePayment()]).split("\r\n");
    expect(row).toContain('"$84.00 USD"');
    expect(row).toContain('"Visa 4242"');
    expect(row.split(",").slice(-3, -1)).toEqual(['""', '""']);
  });

  it("escapes quotes so values cannot break columns", () => {
    const [, row] = paymentsToCsv([
      makePayment({ description: 'Plan "Pro", yearly' }),
    ]).split("\r\n");
    expect(row).toContain('"Plan ""Pro"", yearly"');
  });

  it("shows both timestamps on the viewer’s local calendar date with their UTC offset", () => {
    const payment = makePayment({
      created: Date.UTC(2026, 10, 20, 2, 45, 22),
      refundedAt: Date.UTC(2026, 10, 21, 2, 46, 23),
    });
    const [, row] = paymentsToCsv(
      [payment],
      ["Date", "Refunded date"],
      "America/Sao_Paulo",
    ).split("\r\n");
    expect(row).toMatch(
      /"Nov 19, 2026.*11:45:22 PM GMT-3","Nov 20, 2026.*11:46:23 PM GMT-3"/,
    );
  });

  it("preserves currency symbols, accented names and wallet separators", () => {
    const payment = makePayment({
      name: "João Gonçalves",
      wallet: "Link",
      amount: 99.99,
    });
    const csv = paymentsToCsv(
      ["BRL", "GBP", "EUR", "JPY"].map((currency) => ({
        ...payment,
        currency,
      })),
      ["Amount", "Customer name", "Payment method"],
    );
    for (const symbol of [
      "R$ 99.99 BRL",
      "£99.99 GBP",
      "€99.99 EUR",
      "¥100 JPY",
      "João Gonçalves",
      "Link · Visa",
    ]) {
      expect(csv).toContain(symbol);
    }
  });

  it("returns only the header for no payments", () => {
    expect(paymentsToCsv([]).split("\r\n")).toHaveLength(1);
  });
});
