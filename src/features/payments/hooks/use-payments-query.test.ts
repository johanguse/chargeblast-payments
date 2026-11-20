import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { paymentsListDelayMs } from "@/lib/mock-response";
import { usePaymentsQuery } from "./use-payments-query";

describe("usePaymentsQuery", () => {
  it("reads the initial query from the URL", () => {
    history.replaceState(null, "", "/payments?status=Failed");
    const { result } = renderHook(usePaymentsQuery);
    expect(result.current.params.get("status")).toBe("Failed");
  });

  it("writes changes to the URL and resets the page", () => {
    history.replaceState(null, "", "/payments?page=3");
    const { result } = renderHook(usePaymentsQuery);
    act(() => result.current.update((p) => p.set("q", "4242")));
    expect(location.search).toBe("?q=4242");
    expect(result.current.params.get("q")).toBe("4242");
  });

  it("keeps the page when asked to", () => {
    const { result } = renderHook(usePaymentsQuery);
    act(() => result.current.update((p) => p.set("page", "2"), false));
    expect(location.search).toBe("?page=2");
  });

  it("shows the refresh state for the simulated request time", () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(usePaymentsQuery);
      act(() => result.current.update((p) => p.set("status", "Pending")));
      expect(result.current.refreshing).toBe(true);
      act(() => vi.advanceTimersByTime(paymentsListDelayMs));
      expect(result.current.refreshing).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("ignores changes that leave the URL unchanged", () => {
    const { result } = renderHook(usePaymentsQuery);
    act(() => result.current.update((p) => p.delete("status")));
    expect(result.current.refreshing).toBe(false);
  });

  it("follows browser back and forward", () => {
    const { result } = renderHook(usePaymentsQuery);
    act(() => {
      history.pushState(null, "", "/payments?method=ACH");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.params.get("method")).toBe("ACH");
  });
});
