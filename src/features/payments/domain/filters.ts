import { roundFilterAmount } from "./format";
import { currencies, methods, statuses } from "./payment";

/** Each filter pill edits one group of URL params. */
export const filterGroups = [
  { label: "Date and time", keys: ["range", "from", "to"] },
  { label: "Amount", keys: ["op", "min", "max"] },
  { label: "Currency", keys: ["currency"] },
  { label: "Status", keys: ["status"] },
  { label: "Payment method", keys: ["method"] },
  { label: "More filters", keys: ["q"] },
] as const;

export type FilterGroup = (typeof filterGroups)[number];

/** Checkbox options for multi-select groups, keyed by URL param. */
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

/** Short text shown on an active filter pill, or "" when inactive. */
export function summarizeFilter(group: FilterGroup, p: URLSearchParams) {
  if (group.label === "Amount") {
    const min = p.get("min"),
      max = p.get("max");
    if (!min && !max) return "";
    if (p.get("op") === "gt") return `> ${min}`;
    if (p.get("op") === "lt") return `< ${max}`;
    if (min === max) return `= ${min}`;
    return `${min || "0"} – ${max || "∞"}`;
  }
  if (group.label === "Date and time" && p.get("range") === "Custom")
    return [p.get("from"), p.get("to")].filter(Boolean).join(" – ") || "Custom";
  return p.getAll(group.keys[0]).join(", ");
}

/** Normalizes a filter form into the URL params it should write. */
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

/** Returns an error message for an invalid filter form, or null. */
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
