import { methods, type Payment, statuses } from "../domain/payment";
import { referencePayments } from "./reference-payments";

/**
 * Deterministic demo data: the same `now` always yields the same 600
 * payments, so the list and details pages agree without a database.
 */
const customers = [
  ["Johan Guse", "johan"],
  ["Guse LTDA", "billing"],
  ["Maya Chen", "maya"],
  ["Amelia Costa", "amelia"],
  ["Oliver Reed", "oliver"],
  ["Avery Brooks", "avery"],
  ["Sofia Lima", "sofia"],
  ["Kai Patel", "kai"],
];
export function seedPayments(now: number): Payment[] {
  let state = 7291;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const pick = <T>(values: readonly T[]) =>
    values[Math.floor(random() * values.length)];
  const midnight = new Date(now);
  midnight.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: 600 }, (_, i) => {
    const reference = i < 11;
    const [name, mail] = reference
      ? customers[[0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1][i]]
      : pick(customers);
    const method = reference ? "Card" : pick(methods);
    const currency = reference
      ? "USD"
      : pick(["USD", "EUR", "GBP", "JPY", "CAD"]);
    const amount = reference
      ? [180, 84, 9, 9, 84, 84, 84, 276, 276, 276, 9][i]
      : pick([9, 19, 24, 49, 84, 120, 180, 276, 349]) +
        (currency === "JPY" ? 500 : pick([0, 0, 0.5, 0.95, 0.99]));
    const payment: Payment = {
      id:
        "pi_" +
        Math.floor(random() * 1e12).toString(36) +
        Math.floor(random() * 1e12).toString(36) +
        i.toString(36).padStart(4, "0"),
      name,
      email: `${mail}@example.com`,
      amount,
      currency,
      status: reference || random() < 0.62 ? "Succeeded" : pick(statuses),
      method,
      brand:
        method === "ACH"
          ? "Bank"
          : reference
            ? "Visa"
            : pick(["Visa", "Mastercard", "Amex"]),
      last4: reference
        ? "4242"
        : String(Math.floor(random() * 10000)).padStart(4, "0"),
      wallet: method === "Wallet" ? pick(["Apple Pay", "Google Pay"]) : "—",
      created: reference
        ? now - i * Math.min(60000, Math.floor((now - midnight.getTime()) / 12))
        : midnight.getTime() - i * 18000000,
      description:
        reference && [2, 3].includes(i)
          ? "Subscription update"
          : reference
            ? "Subscription creation"
            : pick([
                "Subscription creation",
                "Subscription update",
                "Invoice payment",
                "One-time payment",
              ]),
    };
    const example = referencePayments[i];
    if (example) {
      Object.assign(payment, example);
      payment.description = "Subscription update";
      const customer = customers[i % customers.length];
      payment.name = customer[0];
      payment.email = `${customer[1]}@example.com`;
      payment.method = example.wallet === "—" ? "Card" : "Wallet";
      payment.created = now - i * 60000;
    }
    if (payment.status === "Refunded")
      payment.refundedAt = Math.min(now, payment.created + 86400000);
    if (payment.status === "Failed") payment.declineReason = "Card declined";
    if (payment.method === "ACH" && payment.status === "Failed")
      payment.declineReason = "Bank declined";
    return payment;
  });
}
