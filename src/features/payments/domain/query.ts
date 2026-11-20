import { type Column, defaultSortColumn } from "./columns";
import type { Payment } from "./payment";

/**
 * The payments list keeps all of its state in the URL so views can be
 * shared and survive reloads. These helpers read that state.
 */

export const filterKeys = [
  "range",
  "from",
  "to",
  "min",
  "max",
  "op",
  "currency",
  "status",
  "method",
] as const;

export const dateRangePresets = ["Today", "7 days", "30 days", "Custom"];

export const pageSizes = [25, 50, 100] as const;

export const hasActiveFilters = (params: URLSearchParams) =>
  filterKeys.some((k) => params.has(k)) || params.has("q");

export function clearFilters(params: URLSearchParams) {
  for (const key of [...filterKeys, "q"]) params.delete(key);
}

function dateBounds(params: URLSearchParams, now: number) {
  const preset = params.get("range");
  let start = -Infinity,
    end = Infinity;
  if (preset === "Custom") {
    const from = params.get("from"),
      to = params.get("to");
    if (from) start = new Date(`${from}T00:00:00`).getTime();
    if (to) end = new Date(`${to}T23:59:59.999`).getTime();
  } else if (preset && dateRangePresets.includes(preset)) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (parseInt(preset, 10) || 1) + 1);
    start = d.getTime();
    end = now;
  }
  return { start, end };
}

export function filterPayments(
  data: Payment[],
  params: URLSearchParams,
  now: number,
) {
  const q = (params.get("q") || "").trim().toLowerCase();
  const { start, end } = dateBounds(params, now);
  const currencies = params.getAll("currency"),
    statuses = params.getAll("status"),
    methods = params.getAll("method"),
    op = params.get("op"),
    min = Number(params.get("min") || 0),
    max = Number(params.get("max") || Infinity);
  return data.filter(
    (p) =>
      (!currencies.length || currencies.includes(p.currency)) &&
      (!statuses.length || statuses.includes(p.status)) &&
      (!methods.length || methods.includes(p.method)) &&
      (op !== "gt" || p.amount > min) &&
      (op !== "lt" || p.amount < max) &&
      p.amount >= min &&
      p.amount <= max &&
      p.created >= start &&
      p.created <= end &&
      [p.id, p.email, p.last4].some((value) => value.toLowerCase().includes(q)),
  );
}

export function readSort(params: URLSearchParams) {
  return {
    column: (params.get("sort") || defaultSortColumn) as Column,
    ascending: params.get("dir") === "asc",
  };
}

export function toggleSort(params: URLSearchParams, column: Column) {
  const { column: current, ascending } = readSort(params);
  params.set("dir", current === column && ascending ? "desc" : "asc");
  params.set("sort", column);
}

export function sortPayments(rows: Payment[], params: URLSearchParams) {
  const key = params.get("sort"),
    direction = params.get("dir") === "asc" ? 1 : -1;
  return rows.sort(
    (a, b) =>
      direction *
        (key === "Amount"
          ? a.amount - b.amount
          : key === "Status"
            ? a.status.localeCompare(b.status)
            : a.created - b.created) || a.id.localeCompare(b.id),
  );
}

export function queryPayments(
  data: Payment[],
  params: URLSearchParams,
  now: number,
) {
  return sortPayments(filterPayments(data, params, now), params);
}

export function paginate<T>(rows: T[], params: URLSearchParams) {
  const requested = Number(params.get("size"));
  const size = (pageSizes as readonly number[]).includes(requested)
    ? requested
    : pageSizes[0];
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const page = Math.max(
    1,
    Math.min(pages, Math.floor(Number(params.get("page"))) || 1),
  );
  const start = (page - 1) * size;
  return {
    size,
    page,
    pages,
    start,
    end: Math.min(start + size, rows.length),
    rows: rows.slice(start, start + size),
  };
}
