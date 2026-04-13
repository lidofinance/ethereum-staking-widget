import { useCallback } from 'react';

import { useMainnetOnlyWagmi } from 'modules/web3';
import { AggregatorAbi } from 'abi/aggregator-abi';
import { wstethABI } from 'abi/wsteth-abi';

import {
  CHAINLINK_FEEDS,
  SELL_TOKEN_FEED_MAP,
  BUY_TOKEN_FEED_MAP,
  WSTETH_ADDRESS,
  PARTNER_FEE_PCT,
} from './consts';
import { safeParseDecimal } from './utils';
import {
  isValidRound,
  isInBounds,
  CHAINLINK_SCALE,
  WSTETH_SCALE,
  WSTETH_RATE_MIN,
  WSTETH_RATE_MAX,
  type RoundData,
} from './oracle-utils';
import type { OnTradeParamsPayload } from './types';

export type OracleResult =
  | { ok: true; sellTokenUsd: number; buyTokenUsd: number; deviation: number }
  | { ok: false; reason: 'unsupported' | 'unavailable' };

const FAIL_UNSUPPORTED: OracleResult = { ok: false, reason: 'unsupported' };
const FAIL_UNAVAILABLE: OracleResult = { ok: false, reason: 'unavailable' };

export const useOracleRates = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const verifyWithOracle = useCallback(
    async (params: OnTradeParamsPayload): Promise<OracleResult> => {
      if (!publicClientMainnet) return FAIL_UNAVAILABLE;

      const sellAddr = params.sellToken?.address.toLowerCase();
      const buyAddr = params.buyToken?.address.toLowerCase();
      if (!sellAddr || !buyAddr) return FAIL_UNSUPPORTED;

      const sellFeedKey = SELL_TOKEN_FEED_MAP[sellAddr];
      const buyFeedKey = BUY_TOKEN_FEED_MAP[buyAddr];
      if (!sellFeedKey || !buyFeedKey) return FAIL_UNSUPPORTED;

      const sellFeed = CHAINLINK_FEEDS[sellFeedKey];
      const buyFeed = CHAINLINK_FEEDS[buyFeedKey];
      if (!sellFeed || !buyFeed) return FAIL_UNSUPPORTED;

      try {
        const isWsteth = sellAddr === WSTETH_ADDRESS;

        // Individual readContract calls — Multicall3 is not in /api/rpc allowlist
        const [sellRoundData, buyRoundData, wstethRate] = await Promise.all([
          publicClientMainnet.readContract({
            address: sellFeed.address,
            abi: AggregatorAbi,
            functionName: 'latestRoundData',
          }) as Promise<RoundData>,
          publicClientMainnet.readContract({
            address: buyFeed.address,
            abi: AggregatorAbi,
            functionName: 'latestRoundData',
          }) as Promise<RoundData>,
          isWsteth
            ? publicClientMainnet.readContract({
                address: WSTETH_ADDRESS,
                abi: wstethABI,
                functionName: 'stEthPerToken',
              })
            : Promise.resolve(null),
        ] as const);

        // Validate rounds
        const nowSec = BigInt(Math.floor(Date.now() / 1000));
        if (!isValidRound(sellRoundData, sellFeed.maxStaleness, nowSec))
          return FAIL_UNAVAILABLE;
        if (!isValidRound(buyRoundData, buyFeed.maxStaleness, nowSec))
          return FAIL_UNAVAILABLE;

        const sellAnswer = sellRoundData[1];
        const buyAnswer = buyRoundData[1];

        // Sanity bounds
        if (!isInBounds(sellAnswer, sellFeedKey)) return FAIL_UNAVAILABLE;
        if (!isInBounds(buyAnswer, buyFeedKey)) return FAIL_UNAVAILABLE;

        // wstETH → stETH conversion
        let sellPriceScaled = sellAnswer;
        if (isWsteth) {
          if (wstethRate == null) return FAIL_UNAVAILABLE;
          if (wstethRate < WSTETH_RATE_MIN || wstethRate > WSTETH_RATE_MAX)
            return FAIL_UNAVAILABLE;
          sellPriceScaled = (sellPriceScaled * wstethRate) / WSTETH_SCALE;
        }

        // Compute deviation
        const sellUnits = safeParseDecimal(
          params.sellTokenAmount?.units?.toString(),
        );
        const buyUnits = safeParseDecimal(
          params.buyTokenAmount?.units?.toString(),
        );

        const isInvalidUnits =
          sellUnits === null ||
          sellUnits <= 0 ||
          buyUnits === null ||
          buyUnits <= 0;

        if (isInvalidUnits) return FAIL_UNAVAILABLE;

        const sellTokenUsd = Number(sellPriceScaled) / Number(CHAINLINK_SCALE);
        const buyTokenUsd = Number(buyAnswer) / Number(CHAINLINK_SCALE);
        const expectedSellUsd = sellUnits * sellTokenUsd;
        const actualBuyUsd = buyUnits * buyTokenUsd;
        if (expectedSellUsd <= 0) return FAIL_UNAVAILABLE;

        // Subtract partner fee — known fixed cost, not unexpected loss
        const deviation =
          ((expectedSellUsd - actualBuyUsd) / expectedSellUsd) * 100 -
          PARTNER_FEE_PCT;

        return { ok: true, sellTokenUsd, buyTokenUsd, deviation };
      } catch {
        return FAIL_UNAVAILABLE;
      }
    },
    [publicClientMainnet],
  );

  return { verifyWithOracle };
};
