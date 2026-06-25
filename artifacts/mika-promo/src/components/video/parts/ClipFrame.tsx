import { useEffect, useRef } from 'react';

interface ClipFrameProps {
  src: string;
  start: number;
  objectClass?: string;
  className?: string;
}

export function ClipFrame({
  src,
  start,
  objectClass = 'object-contain',
  className = '',
}: ClipFrameProps) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const seekAndPlay = () => {
      try {
        video.currentTime = start;
      } catch {
        /* ignore */
      }
      video.play().catch(() => {});
    };

    if (video.readyState >= 1) {
      seekAndPlay();
    } else {
      video.addEventListener('loadedmetadata', seekAndPlay, { once: true });
    }

    return () => video.removeEventListener('loadedmetadata', seekAndPlay);
  }, [start, src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={src.replace(/\.mp4$/, '.jpg')}
      muted
      playsInline
      autoPlay
      loop
      preload="auto"
      className={`w-full h-full ${objectClass} ${className}`}
    />
  );
}
