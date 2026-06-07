'use client';

type Props = { videoId: string; title: string };

export function VideoBlock({ videoId, title }: Props) {
  if (!videoId) return null;
  return (
    <div className="relative my-10 aspect-video w-full">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?dnt=1&color=ffffff`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        className="absolute inset-0 h-full w-full"
        loading="lazy"
      />
    </div>
  );
}
