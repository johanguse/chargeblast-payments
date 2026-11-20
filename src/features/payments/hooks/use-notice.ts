import { useEffect, useState } from "react";

export function useNotice(durationMs = 2500) {
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), durationMs);
    return () => clearTimeout(timer);
  }, [notice, durationMs]);
  return [notice, setNotice] as const;
}
