// Shared by the server (to format dates) and the browser (to report its zone),
// so this module must stay free of server-only imports.

/** Cookie holding the browser's IANA time zone, e.g. "America/Chicago". */
export const TIME_ZONE_COOKIE = "tz";

export function isValidTimeZone(value: string | undefined): value is string {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
