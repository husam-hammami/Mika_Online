import { createContext, useContext } from 'react';

export type VideoFormat = 'wide' | 'square';

export const FormatContext = createContext<VideoFormat>('wide');

export const useFormat = () => useContext(FormatContext);

export function resolveFormatFromUrl(): VideoFormat {
  if (typeof window === 'undefined') return 'wide';
  const value = new URLSearchParams(window.location.search).get('format');
  return value === 'square' || value === '1:1' ? 'square' : 'wide';
}
