import { describe, expect, it } from 'vitest';

import { METAVAULT_CHART_DATA_SCHEMA } from '../apy-data/metavault-apy';

const row = (tvl: { amount: string; decimals: number }) => ({
  tvl: { asset: 'wstETH', ...tvl },
  total_shares: { amount: '1', decimals: 18 },
  lp_price: { value: '1', decimals: 18 },
  timestamp: '1773100800',
  block_number: '1',
  apy: { value: '5.25', type: 'twa' },
});

describe('METAVAULT_CHART_DATA_SCHEMA', () => {
  it('accepts an unsigned integer tvl amount', () => {
    expect(
      METAVAULT_CHART_DATA_SCHEMA.safeParse([
        row({ amount: '1234000000000000000000', decimals: 18 }),
      ]).success,
    ).toBe(true);
  });

  // `BigInt(amount)` runs in render: anything it would throw on must fail
  // the query instead, so the chart shows its no-data state
  it.each(['1234.5', '1e21', 'NaN', '-1', ''])(
    'rejects tvl amount %j',
    (amount) => {
      expect(
        METAVAULT_CHART_DATA_SCHEMA.safeParse([row({ amount, decimals: 18 })])
          .success,
      ).toBe(false);
    },
  );

  it('rejects tvl decimals outside the ERC-20 range', () => {
    expect(
      METAVAULT_CHART_DATA_SCHEMA.safeParse([
        row({ amount: '1', decimals: 256 }),
      ]).success,
    ).toBe(false);
  });
});
