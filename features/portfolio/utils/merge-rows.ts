import type { PortfolioRow } from '../types';

const addNullable = (first: number | null, second: number | null) =>
  first == null && second == null ? null : (first ?? 0) + (second ?? 0);

const mergeTwoRows = (
  firstRow: PortfolioRow,
  secondRow: PortfolioRow,
): PortfolioRow => ({
  ...firstRow,
  amount:
    firstRow.amount != null &&
    secondRow.amount != null &&
    firstRow.decimals === secondRow.decimals
      ? firstRow.amount + secondRow.amount
      : null,
  valueUsd: addNullable(firstRow.valueUsd, secondRow.valueUsd),
  rewardsUsd: addNullable(firstRow.rewardsUsd, secondRow.rewardsUsd),
  // rows without rewards take the symbol of the side that has them
  rewardsAmount:
    firstRow.rewardsSymbol == null ||
    secondRow.rewardsSymbol == null ||
    firstRow.rewardsSymbol === secondRow.rewardsSymbol
      ? addNullable(firstRow.rewardsAmount, secondRow.rewardsAmount)
      : null,
  rewardsSymbol: firstRow.rewardsSymbol ?? secondRow.rewardsSymbol,
  chains: [...firstRow.chains, ...secondRow.chains],
});

// a token keeps its id while its merged row changes chains on refresh
export const getRowId = (row: PortfolioRow): string => row.iconToken ?? row.key;

// one row per verified token across chains; unknown tokens stay per chain
export const mergeRows = (rows: PortfolioRow[]): PortfolioRow[] => {
  const rowsById = new Map<string, PortfolioRow>();
  for (const row of rows) {
    const id = getRowId(row);
    const existingRow = rowsById.get(id);
    rowsById.set(id, existingRow ? mergeTwoRows(existingRow, row) : row);
  }
  return [...rowsById.values()];
};

export const sortByValue = (rows: PortfolioRow[]): PortfolioRow[] =>
  [...rows].sort(
    (firstRow, secondRow) =>
      (secondRow.valueUsd ?? 0) - (firstRow.valueUsd ?? 0),
  );
