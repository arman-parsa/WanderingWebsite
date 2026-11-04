/** Shown while a commission streams in: the dark page surface, no spinner. */
export default function CommissionLoading() {
  return (
    <main id="main-content" className="commission-page" aria-busy="true">
      <p className="sr-only" role="status">Loading commission…</p>
    </main>
  );
}
