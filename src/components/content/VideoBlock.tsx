'use client';

import { parseVimeo, type MediaWidth } from '@/lib/articleMedia';
import { AmbientVimeo } from './AmbientVimeo';
import { useLightbox } from './MediaLightbox';

type Props = {
  videoId?: string;
  title: string;
  caption?: string;
  width?: MediaWidth;
  /** The Sanity block _key — when registered with the lightbox, clicking the film enlarges it. */
  lightboxKey?: string;
};

const FIGURE_CLASS: Record<MediaWidth, string> = {
  column: 'my-12 -mx-[var(--content-padding-x)]',
  wide: 'my-12 media-wide',
  full: 'my-14 media-full',
};

export function VideoBlock({ videoId, title, caption, width = 'column', lightboxKey }: Props) {
  const lightbox = useLightbox();
  if (!parseVimeo(videoId)) return null;

  const clickable =
    !!lightboxKey && !!lightbox && lightbox.entries.some((e) => e.key === lightboxKey);

  return (
    <figure className={FIGURE_CLASS[width]}>
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <AmbientVimeo
          videoId={videoId}
          title={title}
          enlarge={
            clickable
              ? { label: `Enlarge film: ${title}`, onClick: () => lightbox.openAt(lightboxKey) }
              : undefined
          }
        />
      </div>
      {caption && (
        <figcaption className="mt-3 px-[var(--content-padding-x)] text-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
