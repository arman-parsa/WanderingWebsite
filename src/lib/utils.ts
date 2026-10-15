export function formatDate(dateString: string): string {
  // Always UK time, whoever is viewing: Sanity's "Published At" is a
  // date-time stored in UTC, so a piece published just after midnight in
  // British Summer Time would otherwise show the previous day. Date-only
  // strings (UTC midnight) still land on the same date, as London is never
  // behind UTC.
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });
}
