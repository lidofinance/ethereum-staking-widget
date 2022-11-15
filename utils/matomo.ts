import { AppCookies, COOKIES_ALLOWED_KEY, COOKIE_VALUE_YES } from 'utils';
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();
const { matomoUrl } = publicRuntimeConfig;

const checkIsInitMatomo = () => {
  if (typeof window === 'undefined') return false;

  const isAllowedCookie =
    AppCookies.getCookie(COOKIES_ALLOWED_KEY) === COOKIE_VALUE_YES;

  if (!isAllowedCookie) return false;
  if (window._paq) return true;
};

const initMatomo = () => {
  if (typeof window === 'undefined' || !matomoUrl) return;

  const isAllowedCookie =
    AppCookies.getCookie(COOKIES_ALLOWED_KEY) === COOKIE_VALUE_YES;
  if (!isAllowedCookie) return;

  window._paq ??= [];

  window?._paq?.push(
    ['requireCookieConsent'],
    ['trackPageView'],
    ['enableLinkTracking'],
    ['setTrackerUrl', new URL('/matomo.php', matomoUrl).href],
    ['setSiteId', '1'],
    ['setDomains', [`*.${location.hostname.split('.').slice(-2).join('.')}`]],
    ['enableCrossDomainLinking'],
  );
  document.documentElement.appendChild(
    Object.assign(document.createElement('script'), {
      async: true,
      src: new URL('/matomo.js', matomoUrl).href,
    }),
  );
};

initMatomo();

export const callMatomo = (apiMethod: string, ...args: unknown[]) => {
  if (!checkIsInitMatomo()) initMatomo();
  if (typeof window !== 'undefined') {
    window._paq?.push([apiMethod, ...args]);
  }
};

export type MatomoEvent = [category: string, action: string, name: string];

export const trackEvent = (...event: MatomoEvent) => {
  callMatomo('trackEvent', ...event);
};

export const wrapWithEventTrack = <A extends unknown[], R>(
  event: MatomoEvent | void,
  fn: (...args: A) => R,
) =>
  event
    ? (...args: A): R => {
        callMatomo('trackEvent', ...event);
        return fn?.(...args);
      }
    : fn;
