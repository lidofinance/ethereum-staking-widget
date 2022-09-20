import Cookies from 'js-cookie';

import { getTopLevelDomain, themeCookieExpire } from '@lidofinance/lido-ui';

const STORAGE_THEME_AUTO_KEY = 'lido-theme-auto';
const STORAGE_THEME_MANUAL_KEY = 'lido-theme-manual';

export const removeOldCookiesClientSide = (): void => {
  const topLevelDomain = getTopLevelDomain();

  const cookie_theme_auto = Cookies.get(STORAGE_THEME_AUTO_KEY);
  const cookie_theme_manual = Cookies.get(STORAGE_THEME_MANUAL_KEY);

  Cookies.remove(STORAGE_THEME_AUTO_KEY);
  Cookies.remove(STORAGE_THEME_MANUAL_KEY);

  if (cookie_theme_auto) {
    const cookie = `${STORAGE_THEME_AUTO_KEY}=${cookie_theme_auto};expires=${themeCookieExpire};path=/;domain=${topLevelDomain};samesite=None;`;
    document.cookie = cookie;
    document.cookie = `${cookie}Secure;`;
  }

  if (cookie_theme_manual) {
    const cookie = `${STORAGE_THEME_MANUAL_KEY}=${cookie_theme_manual};expires=${themeCookieExpire};path=/;domain=${topLevelDomain};samesite=None;`;
    document.cookie = cookie;
    document.cookie = `${cookie}Secure;`;
  }
};
