import Cookies from 'js-cookie';

// NOT Deprecated!!!
const appId = 'LIDO_WIDGET__';
export const COOKIES_ALLOWED_FULL_KEY = `${appId}COOKIES_ALLOWED`;

// Deprecated. Delete in future
export const COOKIES_ALLOWED_KEY = 'COOKIES_ALLOWED';
export const COOKIE_VALUE_YES = 'yes';
export const COOKIE_VALUE_NO = 'no';

// Deprecated. Delete in future
export const AppCookies = new (class {
  getCookie(name: string) {
    try {
      return Cookies.get(`${appId}${name}`) ?? null;
    } catch (e) {
      return null;
    }
  }

  setCookie(
    name: string,
    value: string,
    expireTime: number = 90 * 24 * 60 * 60,
  ) {
    try {
      const expires = new Date(new Date().getTime() + expireTime * 1000);

      Cookies.set(`${appId}${name}`, value, {
        sameSite: 'None',
        secure: true,
        expires,
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  deleteCookie(name: string) {
    return this.setCookie(name, '', -1);
  }

  isCookiesAllowed() {
    return (
      document &&
      document.cookie &&
      this.getCookie(COOKIES_ALLOWED_KEY) === COOKIE_VALUE_YES
    );
  }

  allowCookies() {
    return this.setCookie(COOKIES_ALLOWED_KEY, COOKIE_VALUE_YES);
  }

  declineCookies() {
    return this.setCookie(COOKIES_ALLOWED_KEY, COOKIE_VALUE_NO);
  }
})();
