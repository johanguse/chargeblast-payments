import { describe, expect, it } from "vitest";
import { NOW, payments } from "@/test/fixtures";
import { methods, statuses } from "../domain/payment";
import { seedPayments } from "./seed";

describe("seedPayments", () => {
  it("is deterministic for the same clock", () => {
    expect(seedPayments(NOW)).toEqual(payments);
  });

  it("produces 600 payments with unique IDs", () => {
    expect(payments).toHaveLength(600);
    expect(new Set(payments.map((p) => p.id)).size).toBe(600);
  });

  it("covers every status, method and several currencies", () => {
    expect(new Set(payments.map((p) => p.status)).size).toBe(statuses.length);
    expect(new Set(payments.map((p) => p.method)).size).toBe(methods.length);
    expect(new Set(payments.map((p) => p.currency)).size).toBeGreaterThan(2);
  });

  it("never dates a payment in the future", () => {
    expect(payments.every((p) => p.created <= NOW)).toBe(true);
  });

  it("adds refund dates and decline reasons only where they apply", () => {
    for (const p of payments) {
      expect(Boolean(p.refundedAt)).toBe(p.status === "Refunded");
      expect(Boolean(p.declineReason)).toBe(p.status === "Failed");
      if (p.status === "Failed")
        expect(p.declineReason).toBe(
          p.method === "ACH" ? "Bank declined" : "Card declined",
        );
    }
  });

  it("gives wallet payments a wallet name and ACH payments none", () => {
    for (const p of payments) {
      if (p.method === "Wallet") expect(p.wallet).not.toBe("—");
      if (p.method === "ACH") expect(p.wallet).toBe("—");
    }
  });
});
