import { type Column, defaultColumns } from "./columns";
import { formatMoney } from "./format";
import type { Payment } from "./payment";

const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;

function csvValue(
  p: Payment,
  column: Column,
  dates: Intl.DateTimeFormat,
): string {
  switch (column) {
    case "Amount":
      return `${formatMoney(p)} ${p.currency}`;
    case "Status":
      return p.status;
    case "Payment method": {
      const instrument = `${p.brand} ${p.last4}`;
      return p.wallet === "—" ? instrument : `${p.wallet} · ${instrument}`;
    }
    case "Wallet":
      return p.wallet === "—" ? "" : p.wallet;
    case "Date":
      return dates.format(p.created);
    case "Description":
      return p.description;
    case "Customer name":
      return p.name;
    case "Customer":
    case "Billing email":
      return p.email;
    case "Payment ID":
      return p.id;
    case "Refunded date":
      return p.refundedAt == null ? "" : dates.format(p.refundedAt);
    case "Decline reason":
      return p.declineReason || "";
    default:
      return "";
  }
}

export function paymentsToCsv(
  rows: Payment[],
  columns: readonly Column[] = defaultColumns,
  timeZone?: string,
) {
  // By default Intl uses the exporting browser's time zone, like the table.
  const dates = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "shortOffset",
  });
  const records = rows.map((payment) =>
    columns.map((column) => csvValue(payment, column, dates)),
  );
  const csv = [columns, ...records]
    .map((row) => row.map(quote).join(","))
    .join("\r\n");
  // Excel uses the leading byte-order mark to detect UTF-8 on open.
  return `\uFEFF${csv}`;
}
