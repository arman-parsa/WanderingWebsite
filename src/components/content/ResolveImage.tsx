'use client';

import { useCallback, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { sanityLoader } from '@/components/content/SanityImage';

/**
 * A Sanity image that resolves in slowly once it has loaded (.resolve-img in
 * globals.css), instead of popping in or painting top-to-bottom. Images that
 * finished loading before hydration (e.g. from cache) are caught by the ref.
 * Reduced motion: the global rule makes the fade instant.
 */
export function ResolveImage({ className = '', onLoad, alt, ...props }: Omit<ImageProps, 'loader'>) {
  const [loaded, setLoaded] = useState(false);
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <Image
      {...props}
      alt={alt}
      loader={sanityLoader}
      ref={ref}
      className={`resolve-img${loaded ? ' is-loaded' : ''} ${className}`.trim()}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
