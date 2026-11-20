export const defaultColumns = [
  "Amount",
  "Status",
  "Payment method",
  "Description",
  "Customer",
  "Date",
  "Refunded date",
  "Decline reason",
  "Payment ID",
] as const;

export const optionalColumns = [
  "Wallet",
  "Customer name",
  "Agent",
  "Billing email",
  "Customer ID",
  "Dispute amount",
  "Dispute reason",
  "Disputed on",
  "Evidence due by",
  "Evidence submitted at",
  "Invoice",
  "Managed Payments",
  "Receipt email",
] as const;

export const availableColumns = [...defaultColumns, ...optionalColumns];

export type Column = (typeof availableColumns)[number];

export const sortableColumns: readonly Column[] = ["Amount", "Status", "Date"];
export const defaultSortColumn: Column = "Date";

export const isSortable = (column: Column) => sortableColumns.includes(column);

export const defaultWidths: Record<Column, number> = {
  Amount: 132,
  Status: 121,
  "Payment method": 145,
  Description: 156,
  Customer: 272,
  Date: 140,
  "Refunded date": 140,
  "Decline reason": 160,
  "Payment ID": 260,
  Wallet: 110,
  "Customer name": 160,
  Agent: 130,
  "Billing email": 220,
  "Customer ID": 180,
  "Dispute amount": 140,
  "Dispute reason": 160,
  "Disputed on": 140,
  "Evidence due by": 150,
  "Evidence submitted at": 180,
  Invoice: 140,
  "Managed Payments": 150,
  "Receipt email": 220,
};

export const MAX_COLUMN_WIDTH = 480;

/** Payment IDs never truncate, so their column has a wider floor. */
export const minColumnWidth = (column: Column) =>
  column === "Payment ID" ? 260 : 75;

export const clampColumnWidth = (column: Column, width: number) =>
  Math.min(MAX_COLUMN_WIDTH, Math.max(minColumnWidth(column), width));

/** Moves `column` into the slot currently held by `target`. */
export function moveColumn(order: Column[], column: Column, target: Column) {
  if (column === target) return order;
  const next = order.filter((c) => c !== column);
  next.splice(order.indexOf(target), 0, column);
  return next;
}

/** Fixed widths of the checkbox and row-actions columns. */
export const SELECT_COLUMN_WIDTH = 26;
export const ACTIONS_COLUMN_WIDTH = 40;
