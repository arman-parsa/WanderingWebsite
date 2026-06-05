type Props = {
  quote: string;
  attribution?: string;
};

export function PullQuote({ quote, attribution }: Props) {
  return (
    <blockquote className="my-14 -mx-4 border-y border-ink-faint py-10 text-center md:-mx-16">
      <p className="font-serif text-[var(--text-2xl)] font-light italic leading-snug tracking-tight text-ink">
        &ldquo;{quote}&rdquo;
      </p>
      {attribution && (
        <cite className="mt-4 block text-caption not-italic">{attribution}</cite>
      )}
    </blockquote>
  );
}
