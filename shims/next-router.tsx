import { useCallback, useMemo } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router';

import { warnShimUsage } from './shim-guard';

/**
 * Compatibility shim for `next/router` so existing page/feature code can
 * keep importing `useRouter` unchanged. The shape mirrors the subset of
 * `NextRouter` actually used in this codebase (mostly `query`, `isReady`,
 * `replace`, `push`, `pathname`, `asPath`).
 *
 * Resolved via `resolve.alias` in `vite.config.ts` (and tsconfig `paths`)
 * so `import { useRouter } from 'next/router'` works without renaming
 * files. The alias also matches the `next/router.js` specifier some
 * dependencies use.
 *
 * Notes:
 * - `isReady` is always true in React Router 7 (no hydration suspense for
 *   query parsing). This matches the post-mount behavior in Next.
 * - `query` merges dynamic params and search params (Next behavior).
 * - `replace` / `push` accept either a string path or `{ pathname, query }`.
 * - `events` is NOT shimmed — the nprogress wiring is a component in
 *   `app/router-layout.tsx` built on React Router's `useNavigation`.
 */

interface UrlObject {
  pathname?: string;
  query?: Record<string, string | string[] | undefined>;
}

type Url = string | UrlObject;

const buildUrl = (url: Url): string => {
  if (typeof url === 'string') return url;
  const path = url.pathname ?? '/';
  if (!url.query) return path;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(url.query)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const item of v) params.append(k, item);
    } else {
      params.set(k, v);
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
};

interface RouterShim {
  query: Record<string, string | string[] | undefined>;
  /**
   * Shim extension (not in NextRouter): search params only, WITHOUT route
   * params. `query` merges both (Next semantics), but here `pathname` is the
   * RESOLVED path — round-tripping `query` into push/replace would duplicate
   * route params into the query string (`/earn/dvv/deposit?vault=dvv&…`).
   * Use this for building navigation targets.
   */
  searchQuery: Record<string, string | string[] | undefined>;
  pathname: string;
  asPath: string;
  isReady: boolean;
  push: (url: Url) => Promise<boolean>;
  replace: (url: Url) => Promise<boolean>;
  back: () => void;
  reload: () => void;
}

export const useRouter = (): RouterShim => {
  warnShimUsage('next/router');
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const searchQuery = useMemo<
    Record<string, string | string[] | undefined>
  >(() => {
    const out: Record<string, string | string[] | undefined> = {};
    // Multi-value keys are returned as arrays (Next semantics).
    for (const [k, v] of searchParams) {
      const existing = out[k];
      if (existing == null) out[k] = v;
      else if (Array.isArray(existing)) existing.push(v);
      else out[k] = [existing, v];
    }
    return out;
  }, [searchParams]);

  const query = useMemo<Record<string, string | string[] | undefined>>(
    () => ({ ...Object.fromEntries(Object.entries(params)), ...searchQuery }),
    [params, searchQuery],
  );

  const push = useCallback(
    async (url: Url) => {
      void navigate(buildUrl(url));
      return true;
    },
    [navigate],
  );

  const replace = useCallback(
    async (url: Url) => {
      void navigate(buildUrl(url), { replace: true });
      return true;
    },
    [navigate],
  );

  const back = useCallback(() => void navigate(-1), [navigate]);
  const reload = useCallback(() => window.location.reload(), []);

  return {
    query,
    searchQuery,
    pathname: location.pathname,
    asPath: `${location.pathname}${location.search}`,
    isReady: true,
    push,
    replace,
    back,
    reload,
  };
};

// Default export so `import router from 'next/router'` (rare) keeps working.
const routerDefault = { useRouter };
export default routerDefault;

// `Router` is sometimes imported as a type (Next exports both the static
// API and the `NextRouter` type). We re-export the shim type so
// `import { Router } from 'next/router'` compiles. No static API is wired —
// nothing in this codebase uses `Router.events` anymore (the old
// `utils/nprogress.ts` consumer is replaced by `NavigationProgress`).
export type Router = RouterShim;
