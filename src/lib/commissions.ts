/**
 * Commissions — client work, kept entirely apart from the editorial content
 * types (deliberately not in contentTypes.ts, which the Library, Gallery,
 * Earth and homepage use).
 */
import { COMMISSION_DELIVERABLES, COMMISSION_SECTORS } from '@cms/lib/commissionOptions';
import type { SequenceImage } from '@/lib/photoSequence';

export const COMMISSIONS_PATH = '/commissions';

type SanityImageValue = {
  asset?: { _ref?: string };
  alt?: string;
  hotspot?: { x: number; y: number };
  lqip?: string;
};

export type CommissionSummary = {
  clientName: string;
  projectTitle?: string | null;
  slug: string;
  location?: string | null;
  year?: number | null;
  sector?: string | null;
  deliverables?: string[] | null;
  coverImage?: SanityImageValue | null;
};

export type CommissionImage = SequenceImage;

export type Commission = CommissionSummary & {
  brief?: string | null;
  images?: CommissionImage[] | null;
  film?: { vimeoId?: string; title?: string; description?: string } | null;
  testimonial?: { quote?: string; name?: string; role?: string } | null;
};

const SECTOR_LABEL: Record<string, string> = Object.fromEntries(
  COMMISSION_SECTORS.map(({ title, value }) => [value, title]),
);
const DELIVERABLE_LABEL: Record<string, string> = Object.fromEntries(
  COMMISSION_DELIVERABLES.map(({ title, value }) => [value, title]),
);
// Deliverables always read in this order, whatever order they were ticked.
const DELIVERABLE_ORDER = COMMISSION_DELIVERABLES.map(({ value }) => value);

export const commissionHref = (slug: string) => `${COMMISSIONS_PATH}/${slug}`;

/** The project title when set, otherwise the client name. */
export const commissionTitle = (c: Pick<CommissionSummary, 'clientName' | 'projectTitle'>) =>
  c.projectTitle?.trim() || c.clientName;

/** The client name, when it isn't already the title. */
export const commissionClientLine = (c: Pick<CommissionSummary, 'clientName' | 'projectTitle'>) =>
  c.projectTitle?.trim() && c.projectTitle.trim() !== c.clientName ? c.clientName : null;

export const sectorLabel = (value?: string | null) => (value ? SECTOR_LABEL[value] ?? null : null);

export const deliverableLabels = (values?: string[] | null) =>
  [...new Set(values ?? [])]
    .filter((v) => DELIVERABLE_LABEL[v])
    .sort((a, b) => DELIVERABLE_ORDER.indexOf(a) - DELIVERABLE_ORDER.indexOf(b))
    .map((v) => DELIVERABLE_LABEL[v]);

/** "Jebel Akhdar, Oman · 2026" */
export const placeAndYear = (c: Pick<CommissionSummary, 'location' | 'year'>) =>
  [c.location, c.year].filter(Boolean).join(' · ');
