declare global {
  interface Window {
    _paq: undefined | [string, ...unknown[]][];
  }
}

// TEMP
const setTrackerUrl = 'https://matomo.testnet.fi/matomo.php';

const getDomain = () => {
  return location.hostname.split('.').slice(-2).join('.');
};

const injectMatomaScript = () => {
  document.documentElement.appendChild(
    Object.assign(document.createElement('script'), {
      async: true,
      // src: new URL('/matomo.js', window.__env__.MATOMO_TRACKER_HOST).href,
      src: new URL('/matomo.js', setTrackerUrl).href,
    }),
  );
};

export const initMatomo = (): void => {
  if (typeof window === 'undefined') {
    // SSR not supported!
    return;
  }

  if ('_paq' in window) {
    // window._paq has been initialized
    return;
  }

  window._paq ??= [];

  window?._paq?.push(
    ['requireCookieConsent'],
    ['trackPageView'],
    ['enableLinkTracking'],
    // ['setTrackerUrl', new URL('/matomo.php', window.__env__.MATOMO_TRACKER_HOST).href],
    ['setTrackerUrl', new URL('/matomo.php', setTrackerUrl).href],
    ['setSiteId', '1'],
    ['setDomains', [`*.${getDomain()}`]],
    ['enableCrossDomainLinking'],
  );

  injectMatomaScript();
};
