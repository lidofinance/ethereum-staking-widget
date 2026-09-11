import { BACKEND_SCHEMA } from './backend';

const validResponse = {
  events: [
    {
      type: 'reward',
      change: '1000',
      balance: '2000',
      blockTime: '1700000000',
      transactionHash: '0xabc',
      apr: '3.1',
    },
  ],
  totals: { ethRewards: '123456789', currencyRewards: '12.34' },
  averageApr: '3.1',
  ethToStEthRatio: 1,
  stETHCurrencyPrice: { eth: 1, usd: 3000 },
  totalItems: 1,
};

// The deployed /api/rewards contract (test/consts.ts) serializes both totals
// as strings; rejecting them would break the dashboard and the CSV export
describe('BACKEND_SCHEMA', () => {
  it('accepts string totals and converts them to numbers', () => {
    const parsed = BACKEND_SCHEMA.parse(validResponse);
    expect(parsed.totals).toEqual({
      ethRewards: 123456789,
      currencyRewards: 12.34,
    });
  });

  it('still accepts numeric totals', () => {
    const parsed = BACKEND_SCHEMA.parse({
      ...validResponse,
      totals: { ethRewards: 5, currencyRewards: 0 },
    });
    expect(parsed.totals).toEqual({ ethRewards: 5, currencyRewards: 0 });
  });

  it('keeps extra event fields', () => {
    const parsed = BACKEND_SCHEMA.parse(validResponse);
    expect(parsed.events[0]).toMatchObject({ apr: '3.1' });
  });

  it('rejects non-numeric totals', () => {
    expect(() =>
      BACKEND_SCHEMA.parse({
        ...validResponse,
        totals: { ethRewards: 'abc', currencyRewards: '1' },
      }),
    ).toThrow();
  });

  it('rejects a response with missing totals', () => {
    const { totals: _, ...noTotals } = validResponse;
    expect(() => BACKEND_SCHEMA.parse(noTotals)).toThrow();
  });
});
