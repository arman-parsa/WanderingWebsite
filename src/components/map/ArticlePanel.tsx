'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { formatDate } from '@/lib/utils';
import type { Cluster, GlobeItem } from './GlobeView';
import { TYPE_HREF, TYPE_LABEL } from '@/lib/contentTypes';

type Props = {
  cluster: Cluster | null;
  onClose: () => void;
  isMobile: boolean;
};

export default function ArticlePanel({ cluster, onClose, isMobile }: Props) {
  const open = cluster !== null;
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus into the panel when it opens, so keyboard users land on it.
  useEffect(() => {
    if (cluster) closeRef.current?.focus({ preventScroll: true });
  }, [cluster]);

  const label = cluster
    ? cluster.items.length === 1
      ? cluster.items[0].location || cluster.items[0].title
      : `${cluster.items.length} pieces near ${cluster.items[0].location ?? 'this place'}`
    : undefined;

  // While closed the panel is also visibility:hidden (flipped only after the
  // slide-out finishes). Without this, the desktop→mobile style swap on
  // hydration animates between the two off-screen transforms and a white
  // sheet visibly sweeps across the globe on phones.
  const motion: React.CSSProperties = {
    transition: open
      ? 'transform 400ms cubic-bezier(0, 0, 0.2, 1), visibility 0s'
      : 'transform 300ms cubic-bezier(0.4, 0, 1, 1), visibility 0s 300ms',
    visibility: open ? 'visible' : 'hidden',
  };

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
        ...motion,
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
        ...motion,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
      };

  return (
    <div
      style={panelStyle}
      role="dialog"
      aria-label={label}
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      {cluster && (
        <div style={{
          padding: '2rem',
          paddingTop: isMobile ? '1.5rem' : 'calc(4rem + 1.5rem)',
          position: 'relative',
        }}>
          {/* Close */}
          {/* 44px tap target; the extra padding is offset so the × stays put. */}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close panel"
            style={{
              position: 'absolute',
              top: isMobile ? 'calc(1.25rem - 12px)' : 'calc(4rem + 1.25rem - 12px)',
              right: 'calc(1.25rem - 12px)',
              minWidth: '44px',
              minHeight: '44px',
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              color: '#736960',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '16px',
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
        color: '#736960',
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
        color: '#736960',
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
          color: '#736960',
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
          color: '#736960',
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
        color: '#736960',
        margin: '0 0 1.5rem',
      }}>
        {items[0].location ?? ''}
      </p>

      {items.map((item, i) => {
        const href = `${TYPE_HREF[item._type] ?? ''}/${item.slug}`;
        return (
          <div key={`${item._type}-${item.slug}`}>
            {i > 0 && (
              <div style={{ height: '0.5px', backgroundColor: '#ddd9d2', margin: '1.25rem 0' }} />
            )}
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#736960',
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
        // 44px-tall tap target without moving the text.
        padding: '14px 0',
        margin: '-14px 0',
      }}
      className="read-link"
    >
      <span>Read</span>
      <span className="read-link-arrow">→</span>
    </Link>
  );
}
