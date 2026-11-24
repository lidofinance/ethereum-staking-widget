import { DATA_UNAVAILABLE } from 'consts/text';

type FormatPercentProps = {
  value?: number | null;
  fallback?: string;
  decimals: 'unit' | 'percent';
};

type PercentDecimals = FormatPercentProps['decimals'];

// the text FormatPercent renders, for callers that need a string
export const formatPercent = (
  value: number,
  decimals: PercentDecimals,
): string => {
  const normalized = decimals === 'unit' ? value * 100 : value;

  return `${normalized.toFixed(1).replace(/\.0$/, '')}%`;
};

export const FormatPercent = ({
  value,
  fallback = DATA_UNAVAILABLE,
  decimals,
}: FormatPercentProps): React.ReactNode => {
  if (value == undefined || !Number.isFinite(value)) return fallback;

  return formatPercent(value, decimals);
};
