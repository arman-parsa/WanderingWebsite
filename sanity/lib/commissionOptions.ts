/**
 * Commission sector / deliverable options — one list shared by the Studio
 * schema (sanity/schemas/documents/commission.ts) and the site's labels
 * (src/lib/commissions.ts). No imports, so it is safe to use anywhere.
 */
export const COMMISSION_SECTORS = [
  { title: 'Hospitality', value: 'hospitality' },
  { title: 'Outdoor', value: 'outdoor' },
  { title: 'Travel Experience', value: 'travelExperience' },
  { title: 'Conservation', value: 'conservation' },
  { title: 'Editorial', value: 'editorial' },
];

export const COMMISSION_DELIVERABLES = [
  { title: 'Photography', value: 'photography' },
  { title: 'Film', value: 'film' },
  { title: 'Writing', value: 'writing' },
];
