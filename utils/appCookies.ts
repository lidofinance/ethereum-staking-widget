const appId = 'LIDO_WIDGET__';

export const COOKIES_ALLOWED_KEY = 'COOKIES_ALLOWED';
export const COOKIE_VALUE_YES = 'yes';
export const COOKIE_VALUE_NO = 'no';

export const AppCookies = new (class {
  getCookie(name: string) {
    try {
      const cookie = document.cookie;
      if (cookie && cookie.indexOf(`${appId}${name}=`) !== -1) {
        const cookieArr = cookie.split(';');
        for (let i = 0; i < cookieArr.length; i++) {
          const cookieStr = cookieArr[i];
          const startIndex = cookieStr.indexOf(`${appId}${name}=`);
          if (startIndex !== -1) {
            return cookieStr.substring(
              startIndex + appId.length + name.length + 1,
            );
          }
        }
      }
      return null;
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
      const expirationDate = new Date(new Date().getTime() + expireTime * 1000);
      const { host } = window.location;
      const domain =
        host.split('.').length === 1 ? '' : `domain=.${window.location.host};`;
      document.cookie = `${appId}${name}=${value};${domain}expires=${expirationDate.toUTCString()};path=/;`;

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
