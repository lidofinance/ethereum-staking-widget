import type { PortfolioTransaction } from 'utilsApi/portfolio/types';

import type { PortfolioRow } from '../../types';
import {
  formatActivityDate,
  formatActivityTime,
  getOldestTimestamp,
  getParty,
  getRowTransfer,
  getTokenTransactions,
} from '../activity';

const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

const buildTransaction = (
  overrides: Partial<PortfolioTransaction> = {},
): PortfolioTransaction => ({
  id: 'ethereum:0x1',
  hash: '0x1',
  type: 'send',
  timestamp: Date.UTC(2025, 6, 9, 16, 30),
  chainId: 1,
  chainSlug: 'ethereum',
  chainName: 'Ethereum',
  product: null,
  counterparty: '0x2222222222222222222222222222222222222222',
  transfers: [
    {
      direction: 'out',
      symbol: 'USDC',
      name: 'USD Coin',
      tokenAddress: USDC,
      amount: 100,
      valueUsd: 100,
    },
  ],
  ...overrides,
});

describe('getTokenTransactions', () => {
  const row = {
    chains: [{ slug: 'ethereum', address: USDC, isNative: false }],
  } as unknown as PortfolioRow;

  it('matches by contract and chain, not by symbol', () => {
    const fakeTokenTransaction = buildTransaction({
      id: 'fake',
      transfers: [
        {
          direction: 'in',
          symbol: 'USDC',
          name: 'USD Coin',
          tokenAddress: '0x1111111111111111111111111111111111111111',
          amount: 1,
          valueUsd: 1,
        },
      ],
    });
    const otherChainTransaction = buildTransaction({
      id: 'base',
      chainSlug: 'base',
    });
    expect(
      getTokenTransactions(
        [buildTransaction(), fakeTokenTransaction, otherChainTransaction],
        row,
      ).map((transaction) => transaction.id),
    ).toEqual(['ethereum:0x1']);
  });

  const ethTransfer = {
    direction: 'out' as const,
    symbol: 'ETH',
    name: 'Ether',
    tokenAddress: null,
    amount: 1,
    valueUsd: 2000,
  };
  const stakeTransaction = buildTransaction({
    id: 'stake',
    type: 'stake',
    transfers: [ethTransfer],
  });
  const requestTransaction = buildTransaction({
    id: 'request',
    type: 'withdrawalRequest',
    transfers: [{ ...buildTransaction().transfers[0], symbol: 'stETH' }],
  });

  it('gives native coin transfers to the native row only', () => {
    const nativeRow = {
      chains: [{ slug: 'ethereum', address: null, isNative: true }],
    } as unknown as PortfolioRow;
    const tokenlessRow = {
      chains: [{ slug: 'ethereum', address: null, isNative: false }],
    } as unknown as PortfolioRow;
    expect(getTokenTransactions([stakeTransaction], nativeRow)).toHaveLength(1);
    expect(getTokenTransactions([stakeTransaction], tokenlessRow)).toEqual([]);
  });

  it('finds the activity of a tokenless row by operation type', () => {
    const withdrawalRow = {
      activityTypes: ['withdrawalRequest', 'withdrawalClaim'],
      chains: [{ slug: 'ethereum', address: null, isNative: false }],
    } as unknown as PortfolioRow;
    expect(
      getTokenTransactions(
        [stakeTransaction, requestTransaction, buildTransaction()],
        withdrawalRow,
      ).map((transaction) => transaction.id),
    ).toEqual(['request']);
    // the amount shown is the first transfer of the operation
    expect(getRowTransfer(requestTransaction, withdrawalRow)).toMatchObject({
      symbol: 'stETH',
      direction: 'out',
    });
  });

  it('picks the transfer of the row token for the amount', () => {
    expect(getRowTransfer(buildTransaction(), row)).toMatchObject({
      tokenAddress: USDC,
    });
    expect(getRowTransfer(stakeTransaction, row)).toBeUndefined();
  });
});

describe('getParty', () => {
  it('names a Lido product before the counterparty', () => {
    expect(
      getParty(buildTransaction({ type: 'stake', product: 'Staking' })),
    ).toMatchObject({
      label: 'To',
      value: 'Staking',
    });
  });

  it('shows the counterparty of a send or receive', () => {
    const incoming = buildTransaction({
      type: 'receive',
      transfers: [{ ...buildTransaction().transfers[0], direction: 'in' }],
    });
    expect(getParty(incoming)).toEqual({
      label: 'From',
      value: '0x2222222222222222222222222222222222222222',
    });
  });

  it('falls back to the transaction hash', () => {
    expect(getParty(buildTransaction({ type: 'swap' }))).toEqual({
      label: 'Transaction',
      value: '0x1',
    });
  });
});

describe('formatActivityTime', () => {
  it('shows a dash without a timestamp', () => {
    expect(formatActivityTime(null)).toBe('—');
  });

  it('shows the day, month, year and 24-hour time', () => {
    // local time: only the shape is fixed across time zones
    expect(formatActivityTime(Date.UTC(2025, 6, 9, 16, 30))).toMatch(
      /^Jul \d{1,2}, 2025, \d{2}:\d{2}$/,
    );
  });
});

describe('getOldestTimestamp', () => {
  it('is null for no transactions or none with a time', () => {
    expect(getOldestTimestamp([])).toBeNull();
    expect(
      getOldestTimestamp([buildTransaction({ timestamp: null })]),
    ).toBeNull();
  });

  it('finds the earliest time in any order, skipping unknown ones', () => {
    expect(
      getOldestTimestamp([
        buildTransaction({ timestamp: 300 }),
        buildTransaction({ timestamp: null }),
        buildTransaction({ timestamp: 100 }),
        buildTransaction({ timestamp: 200 }),
      ]),
    ).toBe(100);
  });
});

describe('formatActivityDate', () => {
  it('gives the day, month and year', () => {
    expect(formatActivityDate(new Date(2026, 3, 3, 12).getTime())).toBe(
      'Apr 3, 2026',
    );
  });
});
