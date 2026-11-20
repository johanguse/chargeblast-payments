import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useNotice } from "./use-notice";

it("clears the notice after its duration", () => {
  vi.useFakeTimers();
  try {
    const { result } = renderHook(() => useNotice(1000));
    act(() => result.current[1]("Copied"));
    expect(result.current[0]).toBe("Copied");
    act(() => vi.advanceTimersByTime(999));
    expect(result.current[0]).toBe("Copied");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current[0]).toBe("");
  } finally {
    vi.useRealTimers();
  }
});
