import type { PortfolioRow, PortfolioSummary } from '../types';

const sumUsd = (rows: PortfolioRow[]) =>
  rows.reduce((sum, row) => sum + (row.valueUsd ?? 0), 0);

export const getPortfolioSummary = (
  lidoRows: PortfolioRow[],
  otherRows: PortfolioRow[],
): PortfolioSummary => {
  const lidoUsd = sumUsd(lidoRows);
  const otherUsd = sumUsd(otherRows);
  const netWorthUsd = lidoUsd + otherUsd;
  const rewardsUsdValues = lidoRows.flatMap((row) =>
    row.rewardsUsd == null ? [] : [row.rewardsUsd],
  );

  // debts are negative; shares split the positive value only
  const lidoPositiveUsd = Math.max(lidoUsd, 0);
  const otherPositiveUsd = Math.max(otherUsd, 0);
  const grossUsd = lidoPositiveUsd + otherPositiveUsd;

  return {
    netWorthUsd,
    lidoUsd,
    otherUsd,
    rewardsUsd:
      rewardsUsdValues.length > 0
        ? rewardsUsdValues.reduce((sum, rewardUsd) => sum + rewardUsd, 0)
        : null,
    lidoShare: grossUsd > 0 ? lidoPositiveUsd / grossUsd : 0,
    otherShare: grossUsd > 0 ? otherPositiveUsd / grossUsd : 0,
  };
};
