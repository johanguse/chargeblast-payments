import { formatMoney } from "./format";
import type { Payment } from "./payment";

const headers = [
  "Amount",
  "Status",
  "Payment method",
  "Wallet",
  "Date",
  "Description",
  "Customer name",
  "Customer email",
  "Payment ID",
  "Refunded date",
  "Decline reason",
];

const quote = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;

const toRow = (p: Payment) => [
  `${formatMoney(p)} ${p.currency}`,
  p.status,
  `${p.brand} ${p.last4}`,
  p.wallet,
  new Date(p.created).toISOString(),
  p.description,
  p.name,
  p.email,
  p.id,
  p.refundedAt ? new Date(p.refundedAt).toISOString() : "",
  p.declineReason || "",
];

export function paymentsToCsv(rows: Payment[]) {
  return [headers, ...rows.map(toRow)]
    .map((row) => row.map(quote).join(","))
    .join("\r\n");
}
