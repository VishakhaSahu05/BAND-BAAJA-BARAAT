/**
 * The `YYYY-MM-DD` value a date input should show for a stored timestamp. Values at exactly
 * UTC midnight are date-only and used as-is; real timestamps use the wedding's time zone —
 * the same rule the dashboard API uses when it labels ceremony dates.
 */
export function dateInputValue(iso: string, timeZone: string): string {
  const date = new Date(iso);
  const isDateOnly =
    date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0;
  if (isDateOnly) {
    return iso.slice(0, 10);
  }
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
