type FormatBalanceString = (
  balanceString?: string,
  maxDecimalDigits?: number,
) => string;

export const formatBalanceString: FormatBalanceString = (
  balanceString = '',
  maxDecimalDigits = 4,
) => {
  if (balanceString.includes('.')) {
    const parts = balanceString.split('.');
    return parts[0] + '.' + parts[1].slice(0, maxDecimalDigits);
  }

  return balanceString;
};
