import { describe, expect, it } from 'vitest';

import { TOKENS } from 'consts/tokens';
import type { WithdrawRequestData } from 'modules/mellow-meta-vaults/types/withdraw-request-data';

import {
  getWillReceiveOptionLabel,
  groupUsdWithdrawRequestsByToken,
  mergeUsdWithdrawRequests,
} from '../utils';

const request = (
  timestamp: bigint,
  isClaimable: boolean,
  assets = 1_000_000n,
): WithdrawRequestData => ({
  timestamp,
  shares: 1_000_000_000_000_000_000n,
  isClaimable,
  assets,
});

describe('mergeUsdWithdrawRequests', () => {
  it('tags every request with the queue it came from', () => {
    const { requests } = mergeUsdWithdrawRequests([
      { token: TOKENS.usdc, requests: [request(1n, true)] },
      { token: TOKENS.usdt, requests: [request(2n, false)] },
    ]);

    expect(requests.map(({ token }) => token)).toEqual([
      TOKENS.usdc,
      TOKENS.usdt,
    ]);
  });

  it('splits claimable and pending requests', () => {
    const { claimableRequests, pendingRequests } = mergeUsdWithdrawRequests([
      { token: TOKENS.usdc, requests: [request(1n, true), request(3n, false)] },
      { token: TOKENS.usdt, requests: [request(2n, true)] },
    ]);

    expect(claimableRequests.map(({ timestamp }) => timestamp)).toEqual([
      1n,
      2n,
    ]);
    expect(pendingRequests.map(({ timestamp }) => timestamp)).toEqual([3n]);
  });

  it('orders by ascending timestamp across queues', () => {
    const { requests } = mergeUsdWithdrawRequests([
      {
        token: TOKENS.usdc,
        requests: [request(10n, true), request(30n, true)],
      },
      { token: TOKENS.usdt, requests: [request(20n, true)] },
    ]);

    expect(requests.map(({ timestamp }) => timestamp)).toEqual([10n, 20n, 30n]);
  });

  it('breaks timestamp ties on token so the order is deterministic', () => {
    const { requests } = mergeUsdWithdrawRequests([
      { token: TOKENS.usdt, requests: [request(5n, true)] },
      { token: TOKENS.usdc, requests: [request(5n, true)] },
    ]);

    expect(requests.map(({ token }) => token)).toEqual([
      TOKENS.usdc,
      TOKENS.usdt,
    ]);
  });

  it('preserves the queue order for a USDC-only user', () => {
    const usdcRequests = [request(1n, true), request(2n, true)];

    const { requests } = mergeUsdWithdrawRequests([
      { token: TOKENS.usdc, requests: usdcRequests },
      { token: TOKENS.usdt, requests: undefined },
    ]);

    expect(requests.map(({ timestamp }) => timestamp)).toEqual([1n, 2n]);
  });

  it('handles empty and undefined groups', () => {
    expect(
      mergeUsdWithdrawRequests([
        { token: TOKENS.usdc, requests: [] },
        { token: TOKENS.usdt },
      ]),
    ).toEqual({ requests: [], claimableRequests: [], pendingRequests: [] });
  });
});

describe('groupUsdWithdrawRequestsByToken', () => {
  it('splits requests into a per-token subset', () => {
    const { requests } = mergeUsdWithdrawRequests([
      { token: TOKENS.usdc, requests: [request(1n, true), request(3n, true)] },
      { token: TOKENS.usdt, requests: [request(2n, true)] },
    ]);

    const groups = groupUsdWithdrawRequestsByToken(requests);

    expect(groups[TOKENS.usdc]).toHaveLength(2);
    expect(groups[TOKENS.usdt]).toHaveLength(1);
  });

  it('returns empty groups when there is nothing to claim', () => {
    expect(groupUsdWithdrawRequestsByToken([])).toEqual({
      [TOKENS.usdc]: [],
      [TOKENS.usdt]: [],
    });
  });
});

describe('getWillReceiveOptionLabel', () => {
  it('falls back to the bare symbol when there is no preview', () => {
    expect(
      getWillReceiveOptionLabel({ assets: undefined, symbol: 'USDC' }),
    ).toBe('USDC');
    expect(getWillReceiveOptionLabel({ assets: null, symbol: 'USDT' })).toBe(
      'USDT',
    );
  });

  it('formats the amount with the token decimals', () => {
    // Both payout tokens are 6-decimals.
    expect(
      getWillReceiveOptionLabel({ assets: 310239200n, symbol: 'USDC' }),
    ).toBe('310.2392 USDC');
    expect(
      getWillReceiveOptionLabel({ assets: 309102900n, symbol: 'USDT' }),
    ).toBe('309.1029 USDT');
  });

  it('renders a zero preview', () => {
    expect(getWillReceiveOptionLabel({ assets: 0n, symbol: 'USDC' })).toBe(
      '0.0 USDC',
    );
  });
});
