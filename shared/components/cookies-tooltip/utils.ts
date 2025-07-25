import {
  setCrossDomainCookieClientSide,
  getDomainCookieClientSide,
  removeCookiesClientSide,
  setDomainCookieClientSide,
} from '@lidofinance/lido-ui';
import {
  COOKIE_ALLOWED_KEY,
  COOKIE_VALUE_NO,
  COOKIE_VALUE_YES,
} from './constants';

export const allowCookies = (): void => {
  // For top level domain - *.some-domain.fi
  setCrossDomainCookieClientSide(COOKIE_ALLOWED_KEY, COOKIE_VALUE_YES);

  if (!document.cookie.includes(`${COOKIE_ALLOWED_KEY}=${COOKIE_VALUE_YES}`)) {
    // For specific.domain.fi, if cookie can't be set to top level domain
    setDomainCookieClientSide(COOKIE_ALLOWED_KEY, COOKIE_VALUE_YES);
  }
};

export const declineCookies = (): void => {
  // For top level domain - *.some-domain.fi
  setCrossDomainCookieClientSide(COOKIE_ALLOWED_KEY, COOKIE_VALUE_NO);

  if (!document.cookie.includes(`${COOKIE_ALLOWED_KEY}=${COOKIE_VALUE_NO}`)) {
    // For specific.domain.fi, if cookie can't be set to top level domain
    setDomainCookieClientSide(COOKIE_ALLOWED_KEY, COOKIE_VALUE_NO);
  }
};

export const migrationAllowCookieToCrossDomainCookieClientSide = (
  keyOldCookie: string,
) => {
  const old_cookie_value = getDomainCookieClientSide(keyOldCookie);

  if (!old_cookie_value) {
    return;
  }

  removeCookiesClientSide(keyOldCookie);

  if (old_cookie_value === COOKIE_VALUE_YES) {
    allowCookies();
  } else if (old_cookie_value === COOKIE_VALUE_NO) {
    declineCookies();
  }
  // else noop
};
