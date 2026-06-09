'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { Cluster, GlobeItem } from './GlobeView';

const TYPE_HREF: Record<string, string> = {
  writing: '/writing',
  mixedMedia: '/mixed-media',
  photography: '/photography',
  videography: '/videography',
};

const TYPE_LABEL: Record<string, string> = {
  writing: 'Writing',
  mixedMedia: 'Mixed Media',
  photography: 'Photography',
  videography: 'Videography',
};

type Props = {
  cluster: Cluster | null;
  onClose: () => void;
  isMobile: boolean;
};

export default function ArticlePanel({ cluster, onClose, isMobile }: Props) {
  const open = cluster !== null;

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50vh',
        backgroundColor: '#f8f4ef',
        borderTop: '0.5px solid #ddd9d2',
        zIndex: 30,
        overflowY: 'auto',
        transition: open
          ? 'transform 400ms cubic-bezier(0, 0, 0.2, 1)'
          : 'transform 300ms cubic-bezier(0.4, 0, 1, 1)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
      }
    : {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '340px',
        backgroundColor: '#f8f4ef',
        borderLeft: '0.5px solid #ddd9d2',
        zIndex: 30,
        overflowY: 'auto',
        transition: open
          ? 'transform 400ms cubic-bezier(0, 0, 0.2, 1)'
          : 'transform 300ms cubic-bezier(0.4, 0, 1, 1)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
      };

  return (
    <div style={panelStyle} aria-hidden={!open}>
      {cluster && (
        <div style={{
          padding: '2rem',
          paddingTop: isMobile ? '1.5rem' : 'calc(4rem + 1.5rem)',
          position: 'relative',
        }}>
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              position: 'absolute',
              top: isMobile ? '1.25rem' : 'calc(4rem + 1.25rem)',
              right: '1.25rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              color: '#7a7067',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px',
            }}
          >
            ×
          </button>

          {cluster.items.length === 1 ? (
            <SingleArticle item={cluster.items[0]} />
          ) : (
            <ClusterList items={cluster.items} />
          )}
        </div>
      )}
    </div>
  );
}

function SingleArticle({ item }: { item: GlobeItem }) {
  const href = `${TYPE_HREF[item._type] ?? ''}/${item.slug}`;
  return (
    <>
      {/* Location */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: '#a09890',
        margin: 0,
      }}>
        {item.location ?? ''}
      </p>

      {/* Type */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.62rem',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#a09890',
        margin: '0.5rem 0 0',
      }}>
        {TYPE_LABEL[item._type] ?? item._type}
      </p>

      {/* Title */}
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontWeight: 300,
        fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)',
        lineHeight: 1.2,
        color: '#1c1814',
        margin: '1rem 0 0',
      }}>
        {item.title}
      </h2>

      {/* Description */}
      {item.description && (
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          color: '#7a7067',
          margin: '1rem 0 0',
        }}>
          {item.description}
        </p>
      )}

      {/* Date */}
      {item.publishedAt && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.65rem',
          color: '#a09890',
          margin: '1.5rem 0 0',
        }}>
          {formatDate(item.publishedAt)}
        </p>
      )}

      {/* Read link */}
      <div style={{ marginTop: '2rem' }}>
        <ReadLink href={href} />
      </div>
    </>
  );
}

function ClusterList({ items }: { items: GlobeItem[] }) {
  return (
    <>
      {/* Location (shared) */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: '#a09890',
        margin: '0 0 1.5rem',
      }}>
        {items[0].location ?? ''}
      </p>

      {items.map((item, i) => {
        const href = `${TYPE_HREF[item._type] ?? ''}/${item.slug}`;
        return (
          <div key={item.slug}>
            {i > 0 && (
              <div style={{ height: '0.5px', backgroundColor: '#ddd9d2', margin: '1.25rem 0' }} />
            )}
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#a09890',
              margin: '0 0 0.4rem',
            }}>
              {TYPE_LABEL[item._type] ?? item._type}
              {item.publishedAt && ` · ${formatDate(item.publishedAt)}`}
            </p>
            <Link
              href={href}
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: '1.05rem',
                lineHeight: 1.3,
                color: '#1c1814',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              {item.title}
            </Link>
          </div>
        );
      })}
    </>
  );
}

function ReadLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color: '#1c1814',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
      }}
      className="read-link"
    >
      <span>Read</span>
      <span className="read-link-arrow">→</span>
    </Link>
  );
}
