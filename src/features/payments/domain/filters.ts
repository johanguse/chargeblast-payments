import { roundFilterAmount } from "./format";
import { currencies, methods, statuses } from "./payment";

export const filterGroups = [
  { label: "Date and time", keys: ["range", "from", "to"] },
  { label: "Amount", keys: ["op", "min", "max"] },
  { label: "Currency", keys: ["currency"] },
  { label: "Status", keys: ["status"] },
  { label: "Payment method", keys: ["method"] },
  { label: "More filters", keys: ["q"] },
] as const;

export type FilterGroup = (typeof filterGroups)[number];

export const filterChoices: Partial<Record<string, readonly string[]>> = {
  status: statuses,
  method: methods,
  currency: currencies,
};

export const amountOperators = {
  eq: "is equal to",
  between: "is between",
  gt: "is greater than",
  lt: "is less than",
} as const;

export type AmountOperator = keyof typeof amountOperators;

export function clearFilterGroup(group: FilterGroup, params: URLSearchParams) {
  for (const key of group.keys) params.delete(key);
}

function customDateSummary(from: string | null, to: string | null) {
  const crossesYears = from && to && from.slice(0, 4) !== to.slice(0, 4);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: crossesYears ? "numeric" : undefined,
    timeZone: "UTC",
  });
  function display(value: string) {
    // These are calendar dates, so preserve the selected day in every time zone.
    const stamp = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(stamp) ? formatter.format(stamp) : value;
  }
  if (from && to) {
    if (from === to) return display(from);
    return `${display(from)} – ${display(to)}`;
  }
  if (from) return `is on or after ${display(from)}`;
  if (to) return `is on or before ${display(to)}`;
  return "is a custom range";
}

export function summarizeFilter(group: FilterGroup, p: URLSearchParams) {
  if (group.label === "Amount") {
    const min = p.get("min");
    const max = p.get("max");
    const op = p.get("op");
    if (min && op === "gt") return `${amountOperators.gt} ${min}`;
    if (max && op === "lt") return `${amountOperators.lt} ${max}`;
    if (min && min === max) return `${amountOperators.eq} ${min}`;
    if (min && max) return `${amountOperators.between} ${min} and ${max}`;
    if (min) return `is at least ${min}`;
    if (max) return `is at most ${max}`;
    return "";
  }
  if (group.label === "Date and time") {
    const range = p.get("range");
    if (range === "Today") return "is today";
    if (range === "7 days" || range === "30 days")
      return `is in the last ${range}`;
    if (range !== "Custom") return "";
    return customDateSummary(p.get("from"), p.get("to"));
  }
  if (group.label === "More filters") {
    const query = p.get("q")?.trim();
    return query ? `matching “${query}”` : "";
  }
  const choices = p.getAll(group.keys[0]).filter(Boolean);
  if (!choices.length) return "";
  return `is ${new Intl.ListFormat("en", { type: "disjunction" }).format(choices)}`;
}

export function filterValuesFromForm(fields: FormData) {
  const values = new URLSearchParams();
  for (const [key, raw] of fields) {
    const value = String(raw).trim();
    if (value)
      values.append(
        key,
        key === "min" || key === "max" ? roundFilterAmount(value) : value,
      );
  }
  const min = values.get("min");
  if (values.get("op") === "eq" && min) values.set("max", min);
  if (!values.has("min") && !values.has("max")) values.delete("op");
  return values;
}

export function validateFilterForm(group: FilterGroup, fields: FormData) {
  if (group.label === "Amount" && fields.get("op") === "between") {
    const min = fields.get("min"),
      max = fields.get("max");
    if (
      min &&
      max &&
      Number(roundFilterAmount(String(min))) >
        Number(roundFilterAmount(String(max)))
    )
      return "Maximum must be at least the minimum.";
  }
  if (
    group.label === "Date and time" &&
    fields.get("range") === "Custom" &&
    String(fields.get("from")) > String(fields.get("to"))
  )
    return "End date must be on or after start date.";
  return null;
}
