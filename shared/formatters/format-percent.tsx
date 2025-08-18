import { DATA_UNAVAILABLE } from 'consts/text';

type FormatPercentProps = {
  value?: number;
  fallback?: string;
  decimals: 'unit' | 'percent';
};

export const FormatPercent = ({
  value,
  fallback = DATA_UNAVAILABLE,
  decimals,
}: FormatPercentProps): React.ReactNode => {
  if (value === undefined) return fallback;

  const normalized = decimals === 'unit' ? value * 100 : value;

  return `${normalized.toFixed(1).replace(/\.0$/, '')}%`;
};
