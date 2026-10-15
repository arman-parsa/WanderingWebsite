'use client';

import { PortableText, type PortableTextComponents } from 'next-sanity';
import { ImageBlock } from './ImageBlock';
import { ImagePair } from './ImagePair';
import { PullQuote } from './PullQuote';
import { VideoBlock } from './VideoBlock';

const components: PortableTextComponents = {
  types: {
    imageBlock: ({ value }) => <ImageBlock value={value} />,
    imagePair:  ({ value }) => <ImagePair value={value} />,
    pullQuote:  ({ value }) => <PullQuote quote={value.quote} attribution={value.attribution} />,
    videoBlock: ({ value }) => <VideoBlock videoId={value.vimeoId} title={value.title} caption={value.description} width={value.width} lightboxKey={value._key} />,
  },
  block: {
    h2: ({ children }) => (
      <h2 className="mb-4 mt-12 font-serif text-[length:var(--text-2xl)] font-light leading-snug tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 font-serif text-[length:var(--text-xl)] font-light leading-snug">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-8 font-sans text-[length:var(--text-sm)] uppercase tracking-[0.14em] opacity-80">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-current pl-6 font-serif text-[length:var(--text-lg)] italic opacity-65">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="font-serif text-[length:var(--text-lg)] leading-[var(--leading-relaxed)]">
        {children}
      </p>
    ),
  },
  // The editor offers bullet and numbered lists by default; Tailwind's reset
  // strips list markers, so they're restored here in the body text voice.
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 list-disc space-y-2 pl-6 font-serif text-[length:var(--text-lg)] leading-[var(--leading-relaxed)] marker:opacity-60">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 list-decimal space-y-2 pl-6 font-serif text-[length:var(--text-lg)] leading-[var(--leading-relaxed)] marker:opacity-60">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="underline underline-offset-2 transition-opacity duration-[var(--duration-fast)] hover:opacity-70"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em:     ({ children }) => <em className="italic">{children}</em>,
  },
};

type Props = { value: unknown };

export function PortableTextRenderer({ value }: Props) {
  return <PortableText value={value as Parameters<typeof PortableText>[0]['value']} components={components} />;
}
