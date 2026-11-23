import type { PortfolioAprRange } from '../types';

// lowest and highest of the known rates; none known, no range
export const toAprRange = (
  aprValues: (number | undefined)[],
): PortfolioAprRange | null => {
  const knownAprValues = aprValues.filter(
    (aprValue): aprValue is number => aprValue != null,
  );
  if (knownAprValues.length === 0) return null;
  return {
    min: Math.min(...knownAprValues),
    max: Math.max(...knownAprValues),
  };
};
