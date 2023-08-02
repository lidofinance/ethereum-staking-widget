export const replaceAll = (
  str: string,
  mapObj?: {
    [key: string]: string;
  },
): string => {
  if (!mapObj) return str;

  const re = new RegExp(Object.keys(mapObj).join('|'), 'gi');
  return str.replace(re, (matched) => {
    return mapObj[matched];
  });
};
