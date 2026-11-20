import type { Payment } from "./payment";

const MINUTE = 60_000;

/**
 * Formats a payment amount in the specified currency.
 * @param payment The payment to format.
 * @returns The formatted amount.
 */
export function formatMoney(payment: Pick<Payment, "amount" | "currency">) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: payment.currency,
    currencyDisplay: payment.currency === "BRL" ? "symbol" : "narrowSymbol",
  })
    .format(payment.amount)
    .replace(/^R\$(?=\d)/, "R$ ");
}

/**
 * Formats a date and time in the specified time zone.
 * @param time The time to format.
 * @param timeZone The time zone to use.
 * @returns The formatted date and time.
 */
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

/**
 * Creates a date formatter for a more compact display.
 * @param timeZone The time zone to use.
 * @returns A date formatter.
 */
export function compactDateFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
}

/**
 * Formats a relative time, e.g. "Just now", "5 minutes ago", "3 hours ago", "2 days ago".
 * @param time The time to format.
 * @param now The current time.
 * @returns The formatted relative time.
 */
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

/**
 * Rounds a typed amount to two decimals, leaving non-numeric text alone.
 * @param text The text to round.
 * @returns The rounded text.
 */
export function roundFilterAmount(text: string) {
  return text && Number.isFinite(Number(text))
    ? filterAmountFormat.format(Number(text))
    : text;
}
