import { useEffect, useState } from "react";

/** A short-lived status message for the toast region. */
export function useNotice(durationMs = 2500) {
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), durationMs);
    return () => clearTimeout(timer);
  }, [notice, durationMs]);
  return [notice, setNotice] as const;
}
