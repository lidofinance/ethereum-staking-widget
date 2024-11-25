// 1e18
export const ETHER = 1_000_000_000_000_000_000n;

export const HUMAN_DECIMALS = 8;
export const PRECISE_DECIMALS = 18;

export const HUMAN_DECIMALS_PERCENT = 1;
export const PRECISE_DECIMALS_PERCENT = 5;

export const HUMAN_DECIMALS_CURRENCY = 2;
export const PRECISE_DECIMALS_CURRENCY = 6;

export const CURRENCIES = [
  { id: 'usd', code: 'USD', symbol: '$', name: 'United States Dollar' },
  { id: 'eur', code: 'EUR', symbol: '€', name: 'Euro' },
  { id: 'gbp', code: 'GBP', symbol: '£', name: 'Pound Sterling' },
] as { id: string; code: string; symbol: string; name: string }[];

export const DEFAULT_CURRENCY = CURRENCIES[0];

export const getCurrency = (id: string) => {
  const found = CURRENCIES.find((item) => item.id === id);
  if (!found) throw new Error('Currency not found');
  return found;
};

export type CurrencyType = typeof DEFAULT_CURRENCY;

export const PAGE_ITEMS = 10;
