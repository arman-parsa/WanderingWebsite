import type { StructureResolver } from 'sanity/structure';

/** The single Site Settings document's fixed ID. */
export const SITE_SETTINGS_ID = 'siteSettings';

/** Personal / editorial work — everything the Library, Gallery and Earth show. */
const EDITORIAL_TYPES = ['writing', 'mixedMedia', 'photography', 'videography'];

/** Client work — kept apart from the editorial types (see commission.ts). */
const COMMISSION_TYPES = ['commission'];

/**
 * Studio sidebar: Site Settings first, as one editable document (not a list,
 * so no duplicates), then the editorial content types and any remaining
 * types (e.g. Author) so nothing registered is hidden, then Commissions
 * under their own heading.
 */
export const structure: StructureResolver = (S) => {
  const shown = new Set(['siteSettings', ...EDITORIAL_TYPES, ...COMMISSION_TYPES]);
  const others = S.documentTypeListItems().filter((item) => !shown.has(item.getId() ?? ''));

  return S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id(SITE_SETTINGS_ID)
        .schemaType('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId(SITE_SETTINGS_ID).title('Site Settings')),
      S.divider().title('Personal work'),
      ...EDITORIAL_TYPES.map((type) => S.documentTypeListItem(type)),
      ...others,
      S.divider().title('Commissions'),
      ...COMMISSION_TYPES.map((type) => S.documentTypeListItem(type).title('Commissions')),
    ]);
};
