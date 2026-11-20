import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { paymentsListDelayMs } from "@/lib/mock-response";

export type UpdateParams = (
  change: (params: URLSearchParams) => void,
  resetPage?: boolean,
) => void;

/**
 * Keeps the list's filters, sort and page in the URL query string.
 *
 * Every committed change replaces the history entry and shows the table
 * skeleton for the simulated request time (see mock-response.ts).
 */
export function usePaymentsQuery() {
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const read = () => {
      window.clearTimeout(refreshTimer.current);
      setRefreshing(false);
      setQuery(location.search.slice(1));
    };
    read();
    window.addEventListener("popstate", read);
    return () => {
      window.clearTimeout(refreshTimer.current);
      window.removeEventListener("popstate", read);
    };
  }, []);

  const update = useCallback<UpdateParams>((change, resetPage = true) => {
    const params = new URLSearchParams(location.search);
    const previous = params.toString();
    if (resetPage) params.delete("page");
    change(params);
    const value = params.toString();
    if (value === previous) return;
    window.clearTimeout(refreshTimer.current);
    setRefreshing(true);
    refreshTimer.current = window.setTimeout(
      () => setRefreshing(false),
      paymentsListDelayMs,
    );
    history.replaceState(
      null,
      "",
      location.pathname + (value ? `?${value}` : ""),
    );
    setQuery(value);
  }, []);

  const params = useMemo(() => new URLSearchParams(query), [query]);
  return { params, update, refreshing };
}
