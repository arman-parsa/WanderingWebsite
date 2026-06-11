'use client';

import { PortableText, type PortableTextComponents } from 'next-sanity';
import { ImageBlock } from './ImageBlock';
import { PullQuote } from './PullQuote';
import { VideoBlock } from './VideoBlock';

const components: PortableTextComponents = {
  types: {
    imageBlock: ({ value }) => <ImageBlock value={value} />,
    pullQuote:  ({ value }) => <PullQuote quote={value.quote} attribution={value.attribution} />,
    videoBlock: ({ value }) => <VideoBlock videoId={value.vimeoId} title={value.title} caption={value.description} />,
  },
  block: {
    h2: ({ children }) => (
      <h2 className="mb-4 mt-12 font-serif text-[var(--text-2xl)] font-light leading-snug tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 font-serif text-[var(--text-xl)] font-light leading-snug">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-current pl-6 font-serif text-[var(--text-lg)] italic opacity-65">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
        {children}
      </p>
    ),
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
