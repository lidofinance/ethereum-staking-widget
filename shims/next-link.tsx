import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

import type { Url } from './next-router';

/**
 * Compatibility shim for `next/link` (and the `next/link.js` specifier used
 * by some dependencies). Resolved via Vite alias. Maps
 * `<Link href=... passHref legacyBehavior?>` onto react-router's `<Link to=...>`.
 *
 * Unsupported props (silently dropped): `prefetch`, `shallow`, `locale`,
 * `scroll`. These either don't apply to a SPA + RR7 or are not used
 * meaningfully in this codebase. If a regression turns up, add them here.
 */

export interface LinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  href: Url;
  passHref?: boolean;
  legacyBehavior?: boolean;
  prefetch?: boolean;
  shallow?: boolean;
  scroll?: boolean;
  locale?: string | false;
  replace?: boolean;
  children?: ReactNode;
}

const buildPath = (url: Url): string => {
  if (typeof url === 'string') return url;
  const path = url.pathname ?? '/';
  if (!url.query) return path;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(url.query)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const item of v) params.append(k, item);
    } else {
      params.set(k, String(v));
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
};

const NextLinkShim = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      passHref: _passHref,
      legacyBehavior: _legacy,
      prefetch: _prefetch,
      shallow: _shallow,
      scroll: _scroll,
      locale: _locale,
      replace,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <RouterLink to={buildPath(href)} replace={replace} ref={ref} {...rest}>
        {children}
      </RouterLink>
    );
  },
);
NextLinkShim.displayName = 'NextLinkShim';

export default NextLinkShim;
