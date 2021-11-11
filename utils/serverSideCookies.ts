export const getFromRawCookies = (
  rawCookies: string | undefined,
  name: string,
): string | undefined => {
  if (!rawCookies) {
    return undefined;
  }

  const matches = rawCookies.match(
    /* eslint-disable */
    new RegExp(
      '(?:^|; )' +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
        '=([^;]*)',
    ),
    /* eslint-enable */
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};
