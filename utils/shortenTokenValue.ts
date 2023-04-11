export const shortenTokenValue = (value: number) => {
  const ceilValue = Math.ceil(value);
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
  const suffixNum = Math.floor((('' + ceilValue).length - 1) / 3);
  let shortValue = parseFloat(
    (ceilValue / Math.pow(10, suffixNum * 3)).toFixed(1),
  );

  if (shortValue % 1 !== 0) {
    shortValue = Number(shortValue.toFixed(1));
  }
  return `${shortValue}${suffixes[suffixNum]}`;
};
