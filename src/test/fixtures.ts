import { seedPayments } from "@/features/payments/data/seed";
import type { Payment } from "@/features/payments/domain/payment";

/** A fixed clock so seeded data and relative times are stable. */
export const NOW = new Date("2026-11-19T14:00:00Z").getTime();

export const payments = seedPayments(NOW);

export function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: "pi_test_0001",
    name: "Maya Chen",
    email: "maya@example.com",
    amount: 84,
    currency: "USD",
    status: "Succeeded",
    method: "Card",
    brand: "Visa",
    last4: "4242",
    wallet: "—",
    created: NOW - 5 * 60_000,
    description: "Subscription creation",
    ...overrides,
  };
}

export function formData(entries: [string, string][]) {
  const data = new FormData();
  for (const [key, value] of entries) data.append(key, value);
  return data;
}
