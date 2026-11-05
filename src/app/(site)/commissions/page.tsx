import type { Metadata } from 'next';
import { sanityFetch } from '@/lib/sanityFetch';
import { COMMISSIONS_QUERY } from '@/lib/sanity';
import { pageMetadata } from '@/lib/metadata';
import { CommissionCard } from '@/components/commissions/CommissionCard';
import type { CommissionSummary } from '@/lib/commissions';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Commissions',
  description:
    'Commissioned photography, film and writing by Arman Parsa for hotels, travel experiences, outdoor brands, conservation organisations and editorial clients.',
  path: '/commissions',
});

/**
 * Covers and client names only, in display order then year: one column on
 * phones, a grid from 720px.
 */
export default async function CommissionsPage() {
  const commissions = ((await sanityFetch<CommissionSummary[]>(COMMISSIONS_QUERY)) ?? []).filter(
    (c) => c.slug && c.clientName,
  );

  return (
    <main id="main-content" className="commissions-page">
      <h1 className="sr-only">Commissions</h1>
      {commissions.length > 0 ? (
        <div className="commissions-grid">
          {commissions.map((c, i) => (
            <CommissionCard key={c.slug} commission={c} priority={i < 2} />
          ))}
        </div>
      ) : (
        // Until the first commission is published.
        <p className="commissions-empty">Under construction</p>
      )}
    </main>
  );
}
