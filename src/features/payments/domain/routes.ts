/**
 * The details page is linked with the list's snapshot time, the viewer's
 * time zone and the list query, so it renders the same seeded data and can
 * return to the same view.
 */
export function paymentDetailsHref(
  id: string,
  {
    at,
    timeZone,
    listParams,
  }: { at: number; timeZone: string; listParams: URLSearchParams },
) {
  return (
    "/payments/" +
    id +
    "?" +
    new URLSearchParams({
      at: String(at),
      tz: timeZone,
      back: `?${listParams}`,
    })
  );
}

export const paymentsListHref = (back?: string) =>
  `/payments${back?.startsWith("?") ? back : ""}`;

export function parseSnapshotTime(at: string | undefined) {
  const value = Number(at);
  return Number.isFinite(value) && value > 0 && value < 8.64e15
    ? value
    : Date.now();
}

export function resolveTimeZone(timeZone: string | undefined) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone || "UTC",
    }).resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}
