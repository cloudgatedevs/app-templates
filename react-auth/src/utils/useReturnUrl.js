import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Preserve returnUrl query param across auth page navigation. */
export function useReturnUrl() {
  const [searchParams] = useSearchParams();
  return useMemo(() => searchParams.get('returnUrl')?.trim() || undefined, [searchParams]);
}

/** Append returnUrl to a path when present. */
export function withReturnUrl(path, returnUrl) {
  if (!returnUrl) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}returnUrl=${encodeURIComponent(returnUrl)}`;
}
