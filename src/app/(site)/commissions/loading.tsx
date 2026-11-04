/** Shown while a commissions page streams in: the page's own quiet surface, no spinner. */
export default function CommissionsLoading() {
  return (
    <main id="main-content" className="commissions-page" aria-busy="true">
      <p className="sr-only" role="status">Loading commissions…</p>
    </main>
  );
}
