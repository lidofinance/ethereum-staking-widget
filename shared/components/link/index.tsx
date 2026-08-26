import {
  ComponentProps,
  forwardRef,
  useMemo,
  type AnchorHTMLAttributes,
} from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router';

/**
 * The single navigation link. Replaces the LocalLink / LinkIpfs
 * pair: react-router's <Link> already renders the right href in both
 * router modes (`/path` under createBrowserRouter, `#/path` under
 * createHashRouter in IPFS mode), so no IPFS special case is needed.
 * Scroll-to-top on navigation is handled by <ScrollRestoration /> in
 * app/router-layout.tsx.
 *
 * Outer links (any `href` with a scheme like `https:`/`mailto:` or a
 * protocol-relative `//`) render a plain <a> instead of a router link:
 * they open in a new tab with `rel="noopener noreferrer"` by default
 * (both overridable via props). Internal-only search params
 * (PASSTHROUGH_PARAMS) are never forwarded to external origins.
 */

// Search params forwarded to every internal navigation so integration
// context (referral, embeds, Ledger Live flag, theming, earn allowlist,
// QA flags) survives page switches.
const PASSTHROUGH_PARAMS = [
  'ref',
  'embed',
  'app',
  'theme',
  'earn',
  'forceAllowance',
] as const;

// Anything with a scheme (https:, mailto:, tel:, ...) or protocol-relative
const OUTER_HREF_REGEX = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

export const isOuterLink = (href: string): boolean =>
  OUTER_HREF_REGEX.test(href);

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Omit<ComponentProps<typeof RouterLink>, 'to'> &
  (
    | {
        href: string;
        to?: undefined;
      }
    | {
        to: ComponentProps<typeof RouterLink>['to'];
        href?: undefined;
      }
  );

export const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const [searchParams] = useSearchParams();

  const isOuter = !!props.href && isOuterLink(props.href);

  const to = useMemo(() => {
    if (isOuter) return '';
    if (props.to) return props.to;

    if (!props.href) {
      throw new Error('Link: must specify either `to` or `href` prop');
    }

    const [pathAndQuery = '', hash] = props.href.split('#');
    const [pathname, search = ''] = pathAndQuery.split('?');
    const params = new URLSearchParams(search);
    // does not support duplicates ?ref=01234&ref=56789 (takes the first
    // value); params explicitly set in `href` win over the current URL
    for (const key of PASSTHROUGH_PARAMS) {
      const value = searchParams.get(key);
      if (value && !params.has(key)) params.set(key, value);
    }
    const qs = params.toString();
    const searchPart = qs ? '?' + qs : '';
    const hashPart = hash ? '#' + hash : '';
    return pathname + searchPart + hashPart;
  }, [isOuter, props.href, props.to, searchParams]);

  if (props.to && props.href) {
    throw new Error('Link: cannot specify both `to` and `href` props');
  }

  if (isOuter) {
    const {
      href,
      target,
      rel,
      children,
      // router-only props must not reach the DOM
      to: _to,
      discover: _discover,
      prefetch: _prefetch,
      reloadDocument: _reloadDocument,
      replace: _replace,
      state: _state,
      preventScrollReset: _preventScrollReset,
      relative: _relative,
      viewTransition: _viewTransition,
      ...anchorProps
    } = props;

    return (
      <a
        href={href}
        ref={ref}
        target={target ?? '_blank'}
        rel={rel ?? 'noopener noreferrer'}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={to} ref={ref} {...props}>
      {props.children}
    </RouterLink>
  );
});
Link.displayName = 'Link';
