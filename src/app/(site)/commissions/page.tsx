import type { Metadata } from 'next';
import Link from 'next/link';
import { sanityFetch } from '@/lib/sanityFetch';
import { COMMISSIONS_QUERY } from '@/lib/sanity';
import { pageMetadata } from '@/lib/metadata';
import { CommissionCard } from '@/components/commissions/CommissionCard';
import type { CommissionSummary } from '@/lib/commissions';

export const revalidate = 60;

// Placeholder copy — edit freely.
const COMMISSIONS_INTRO = 'Selected commissions for hotels, travel and outdoor brands.';

export const metadata: Metadata = pageMetadata({
  title: 'Commissions',
  description:
    'Commissioned photography, film and writing by Arman Parsa for hotels, travel experiences, outdoor brands, conservation organisations and editorial clients.',
  path: '/commissions',
});

export default async function CommissionsPage() {
  const commissions = ((await sanityFetch<CommissionSummary[]>(COMMISSIONS_QUERY)) ?? []).filter(
    (c) => c.slug && c.clientName,
  );
  // An odd count leads with one large feature; the rest sit two by two. So one
  // commission is a single feature, two are a pair, three are a feature and a
  // pair… and the layout keeps working as commissions are added.
  const [lead, rest] =
    commissions.length % 2 === 1 ? [commissions[0], commissions.slice(1)] : [null, commissions];

  return (
    <main id="main-content" className="commissions-page">
      <header className="commissions-header">
        <h1 className="commissions-title">Commissions</h1>
        <p className="commissions-intro">{COMMISSIONS_INTRO}</p>
      </header>

      {commissions.length > 0 ? (
        <div className="commissions-list">
          {lead && <CommissionCard commission={lead} feature priority />}
          {rest.length > 0 && (
            <div className="commissions-grid">
              {rest.map((c, i) => (
                <CommissionCard key={c.slug} commission={c} priority={!lead && i < 2} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="commissions-empty">New commissions are on their way.</p>
      )}

      <p className="commissions-enquire">
        <Link href="/contact" className="quiet-link">
          For commissions, get in touch
        </Link>
      </p>
    </main>
  );
}
