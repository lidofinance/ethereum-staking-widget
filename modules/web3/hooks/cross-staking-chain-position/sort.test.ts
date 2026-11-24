import { zeroAddress } from 'viem';

import { getSortGate, sortPositionTokens } from './sort';
import type { CrossStakingChainPositionToken } from './use-cross-chain-balances';

const token = (
  id: string,
  balance: bigint,
  ethValue?: bigint,
  usdValue?: number,
): CrossStakingChainPositionToken => ({
  token: 'eth',
  tokenLabel: id as CrossStakingChainPositionToken['tokenLabel'],
  chainId: 1,
  tokenAddress: zeroAddress,
  balance,
  ethValue,
  usdValue,
});

const labels = (tokens: CrossStakingChainPositionToken[]) =>
  tokens.map(({ tokenLabel }) => tokenLabel);

describe('sortPositionTokens', () => {
  it('non-zero: moves zero balances last and keeps config order otherwise', () => {
    const tokens = [
      token('a', 0n),
      token('b', 1n),
      token('c', 0n),
      token('d', 5n),
    ];
    expect(labels(sortPositionTokens(tokens, 'non-zero'))).toEqual([
      'b',
      'd',
      'a',
      'c',
    ]);
  });

  it('eth: sorts by ETH value, missing values last', () => {
    const tokens = [
      token('a', 10n, 10n),
      token('b', 1n, undefined),
      token('c', 8n, 12n),
    ];
    expect(labels(sortPositionTokens(tokens, 'eth'))).toEqual(['c', 'a', 'b']);
  });

  it('usd: sorts by USD value, missing values last', () => {
    const tokens = [
      token('a', 1n, 1n, 5),
      token('b', 1n, 1n, undefined),
      token('c', 1n, 1n, 20),
    ];
    expect(labels(sortPositionTokens(tokens, 'usd'))).toEqual(['c', 'a', 'b']);
  });

  it('eth: tokens without a value keep non-zero balances first', () => {
    const tokens = [
      token('a', 0n, undefined),
      token('b', 3n, undefined),
      token('c', 0n, 0n),
      token('d', 1n, 1n),
    ];
    expect(labels(sortPositionTokens(tokens, 'eth'))).toEqual([
      'd',
      'c',
      'b',
      'a',
    ]);
  });

  it('does not mutate the input', () => {
    const tokens = [token('a', 0n), token('b', 1n)];
    sortPositionTokens(tokens, 'non-zero');
    expect(labels(tokens)).toEqual(['a', 'b']);
  });
});

describe('getSortGate', () => {
  const settled = { isLoading: false, error: null };
  const loading = { isLoading: true, error: null };
  const failed = { isLoading: false, error: new Error('rate') };

  it('non-zero never waits on converters', () => {
    const tokens = [token('a', 5n, undefined, undefined)];
    expect(
      getSortGate(tokens, 'non-zero', { eth: loading, usd: failed }),
    ).toEqual(settled);
  });

  it('skips a converter when every value is present (zero balances)', () => {
    const tokens = [token('a', 0n, 0n, 0), token('b', 1n, 1n, 3)];
    expect(getSortGate(tokens, 'eth', { eth: failed, usd: failed })).toEqual(
      settled,
    );
  });

  it('waits while a held token misses its value and a dependency loads', () => {
    const tokens = [token('a', 5n, undefined)];
    expect(getSortGate(tokens, 'eth', { eth: loading, usd: settled })).toEqual(
      loading,
    );
  });

  it('fails when a held token misses its value and a dependency failed', () => {
    const tokens = [token('a', 5n, undefined)];
    expect(getSortGate(tokens, 'eth', { eth: failed, usd: settled })).toEqual(
      failed,
    );
  });

  it('eth sort ignores the usd converter', () => {
    const tokens = [token('a', 5n, 5n, undefined)];
    expect(getSortGate(tokens, 'eth', { eth: settled, usd: failed })).toEqual(
      settled,
    );
  });

  it('usd sort waits on the usd converter for held tokens', () => {
    const tokens = [token('a', 5n, 5n, undefined)];
    expect(getSortGate(tokens, 'usd', { eth: settled, usd: loading })).toEqual(
      loading,
    );
  });
});
