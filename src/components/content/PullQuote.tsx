type Props = {
  quote: string;
  attribution?: string;
};

export function PullQuote({ quote, attribution }: Props) {
  return (
    <blockquote className="my-14 -mx-4 border-y border-current py-10 text-center md:-mx-16" style={{ borderColor: 'currentColor', opacity: 1 }}>
      <p className="font-serif text-[var(--text-2xl)] font-light italic leading-snug tracking-tight">
        &ldquo;{quote}&rdquo;
      </p>
      {attribution && (
        <cite className="mt-4 block font-sans text-[var(--text-xs)] uppercase tracking-wide not-italic opacity-60">{attribution}</cite>
      )}
    </blockquote>
  );
}
