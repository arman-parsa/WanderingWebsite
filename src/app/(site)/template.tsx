/**
 * Re-mounts on every navigation, so each page fades in gently (see
 * .page-fade in globals.css; off for reduced-motion users). Keeps the flex
 * column the layout gives pages, so `flex-1` on a page's <main> still works.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-fade flex w-full flex-1 flex-col">{children}</div>;
}
