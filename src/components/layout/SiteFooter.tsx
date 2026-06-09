export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border py-12">
      <div className="mx-auto flex max-w-[var(--content-full-width)] items-center justify-center px-[var(--content-padding-x)]">
        <p className="font-sans text-xs uppercase tracking-widest text-ink-faint">
          © {year} Wandering Website
        </p>
      </div>
    </footer>
  );
}
