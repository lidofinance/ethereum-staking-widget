import { describe, it, expect } from 'vitest';
import { ethAddress } from 'viem';
import type { OnTradeParamsPayload } from '@cowprotocol/events';

import {
  MAINNET_TX_CONFIG,
  SEPOLIA_TX_CONFIG,
} from '../../guards/tx/__tests__/fixtures';
import { shouldRefreshForSellToken } from '../should-refresh-for-sell-token';

const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const SEPOLIA_STETH = '0x3e3fe7dbc6b4c189e7128855dd526361c49b40af';

const payload = (sellToken?: { address?: string; symbol?: string }) =>
  ({ sellToken }) as unknown as OnTradeParamsPayload;

describe('shouldRefreshForSellToken', () => {
  const sellTokens = MAINNET_TX_CONFIG.sellTokens;

  it('keeps selection without sell token', () => {
    expect(shouldRefreshForSellToken(payload(), sellTokens)).toBe(false);
    expect(shouldRefreshForSellToken(payload({}), sellTokens)).toBe(false);
  });

  it('keeps allowed sell token', () => {
    expect(
      shouldRefreshForSellToken(payload({ address: STETH }), sellTokens),
    ).toBe(false);
  });

  it('matches address case-insensitively', () => {
    expect(
      shouldRefreshForSellToken(
        payload({ address: '0xAE7AB96520DE3A18E5E111B5EAAB095312D7FE84' }),
        sellTokens,
      ),
    ).toBe(false);
  });

  it('refreshes for token outside allowlist', () => {
    expect(
      shouldRefreshForSellToken(payload({ address: USDC }), sellTokens),
    ).toBe(true);
    expect(
      shouldRefreshForSellToken(payload({ address: ethAddress }), sellTokens),
    ).toBe(true);
  });

  it('ignores symbol and checks address only', () => {
    expect(
      shouldRefreshForSellToken(
        payload({ address: USDC, symbol: 'stETH' }),
        sellTokens,
      ),
    ).toBe(true);
  });

  it('uses allowlist of the widget chain', () => {
    const sepoliaPayload = payload({ address: SEPOLIA_STETH });
    expect(
      shouldRefreshForSellToken(sepoliaPayload, SEPOLIA_TX_CONFIG.sellTokens),
    ).toBe(false);
    expect(shouldRefreshForSellToken(sepoliaPayload, sellTokens)).toBe(true);
  });
});
