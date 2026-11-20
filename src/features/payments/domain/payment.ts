export const statuses = [
  "Succeeded",
  "Pending",
  "Failed",
  "Refunded",
  "Disputed",
  "Uncaptured",
  "Blocked",
  "Canceled",
] as const;

export const methods = ["Card", "ACH", "Wallet"] as const;

export const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "BRL"] as const;

export type PaymentStatus = (typeof statuses)[number];
export type PaymentMethod = (typeof methods)[number];

export type Payment = {
  id: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  brand: string;
  last4: string;
  wallet: string;
  refundedAt?: number;
  declineReason?: string;
  created: number;
  description: string;
};

export const isSelectable = (payment: Payment) =>
  payment.status === "Succeeded";
