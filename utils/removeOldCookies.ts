import Cookies from 'js-cookie';

const STORAGE_THEME_AUTO_KEY = 'lido-theme-auto';
const STORAGE_THEME_MANUAL_KEY = 'lido-theme-manual';

export const removeOldCookiesClientSide = (): void => {
  Cookies.remove(STORAGE_THEME_AUTO_KEY);
  Cookies.remove(STORAGE_THEME_MANUAL_KEY);
};
