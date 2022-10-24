declare global {
  interface Window {
    _paq: undefined | [string, ...unknown[]][];
  }
}

const getDomain = () => {
  return location.hostname.split('.').slice(-2).join('.');
};

const injectMatomaScript = (matomoHost: string) => {
  document.documentElement.appendChild(
    Object.assign(document.createElement('script'), {
      async: true,
      src: new URL('/matomo.js', matomoHost).href,
    }),
  );
};

export const initMatomo = (matomoHost: string): void => {
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
    ['setTrackerUrl', new URL('/matomo.php', matomoHost).href],
    ['setSiteId', '1'],
    ['setDomains', [`*.${getDomain()}`]],
    ['enableCrossDomainLinking'],
  );

  injectMatomaScript(matomoHost);
};
