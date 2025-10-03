export const getShortenedNumber = (amount: number, fallback: string) => {
  if (!amount) return fallback;

  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  } else if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${amount.toFixed(0).replace(/\.0$/, '')}`;
};
