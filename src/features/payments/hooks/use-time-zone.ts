import { useEffect, useState } from "react";

/**
 * The viewer's time zone. Starts as UTC so the server render and the first
 * client render match, then switches after hydration.
 */
export function useTimeZone() {
  const [zone, setZone] = useState("UTC");
  useEffect(
    () => setZone(Intl.DateTimeFormat().resolvedOptions().timeZone),
    [],
  );
  return zone;
}
