type Props = { data: object };

/** Renders a schema.org JSON-LD script tag. `<` is escaped to prevent script injection. */
export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
