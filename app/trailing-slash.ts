import { replace, type LoaderFunctionArgs } from 'react-router';

/**
 * Trailing-slash normalization — parity with Next.js `trailingSlash: false`,
 * which 308-redirected `/wrap/` → `/wrap`. React Router happily MATCHES the
 * slashed URL but leaves it in the address bar, so every page would exist
 * under two URLs: analytics split, and a shared `/wrap/` link resolves
 * relative URLs differently than `/wrap`.
 *
 * Runs as the ROOT route loader, i.e. before anything renders, in both
 * router modes (in hash mode the route path lives in `url.pathname` of the
 * loader request just the same). The redirect is a history REPLACE, so Back
 * never lands on the slashed variant.
 *
 * A layout loader does not re-run when only its children change, so the
 * router config re-arms it via `shouldRevalidate` — see `hasTrailingSlash`
 * usage in app/router.tsx.
 */

export const hasTrailingSlash = (pathname: string): boolean =>
  pathname.length > 1 && pathname.endsWith('/');

export const stripTrailingSlashLoader = ({
  request,
}: LoaderFunctionArgs): Response | null => {
  const url = new URL(request.url);
  if (!hasTrailingSlash(url.pathname)) return null;

  // '//…' collapses to '' — keep the root path
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  return replace(pathname + url.search + url.hash);
};
