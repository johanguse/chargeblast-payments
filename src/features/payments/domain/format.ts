import type { Payment } from "./payment";

const MINUTE = 60_000;

export function formatMoney(payment: Pick<Payment, "amount" | "currency">) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: payment.currency,
    currencyDisplay: payment.currency === "BRL" ? "symbol" : "narrowSymbol",
  })
    .format(payment.amount)
    .replace(/^R\$(?=\d)/, "R$ ");
}

/** Long date used on the details page, e.g. "Nov 19, 2026, 2:00 PM". */
export function formatDateTime(time: number, timeZone = "UTC") {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(time);
}

/** Short date used in table cells, e.g. "Nov 19, 2:00 PM". */
export function compactDateFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
}

/** "Just now", "5 minutes ago", "3 hours ago", "2 days ago". */
export function formatRelativeTime(time: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - time) / MINUTE));
  if (minutes === 0) return "Just now";
  const [unit, size] =
    minutes >= 1440
      ? (["day", 1440] as const)
      : minutes >= 60
        ? (["hour", 60] as const)
        : (["minute", 1] as const);
  return new Intl.RelativeTimeFormat("en").format(
    -Math.floor(minutes / size),
    unit,
  );
}

const filterAmountFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  useGrouping: false,
});

/** Rounds a typed amount to two decimals, leaving non-numeric text alone. */
export function roundFilterAmount(text: string) {
  return text && Number.isFinite(Number(text))
    ? filterAmountFormat.format(Number(text))
    : text;
}
