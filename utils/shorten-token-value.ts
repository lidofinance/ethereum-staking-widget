export const shortenTokenValue = (value: number) => {
  const ceilValue = Math.ceil(value);
  if (value <= 0) return '0';
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
  // calc a suffix but cap at last one
  const suffixNum = Math.min(
    Math.floor(
      // this prevents scientific notation at large numbers
      (ceilValue.toLocaleString('fullwide', { useGrouping: false }).length -
        1) /
        3,
    ),
    suffixes.length - 1,
  );
  const suffix = suffixes[suffixNum];

  let shortValue = parseFloat(
    (ceilValue / Math.pow(10, suffixNum * 3)).toFixed(1),
  );

  if (shortValue % 1 !== 0) {
    shortValue = Number(shortValue.toFixed(1));
  }
  return `${shortValue}${suffix}`;
};
