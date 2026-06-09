export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border" style={{ padding: '30px clamp(1.5rem, 4vw, 3.75rem)' }}>
      <div className="mx-auto flex max-w-[var(--content-full-width)] items-center justify-between">

        <div aria-hidden="true">
          <svg
            width="22" height="22" viewBox="0 0 28 28" fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon
              points="14,4 26,25 2,25"
              stroke="#7a7067" strokeWidth="1.2"
              strokeLinejoin="round" strokeLinecap="round"
              fill="none"
            />
            <line
              x1="2" y1="11" x2="26" y2="11"
              stroke="#7a7067" strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="font-sans text-xs uppercase tracking-widest text-ink-faint">
          © {year} armanparsa.earth
        </p>

      </div>
    </footer>
  );
}
