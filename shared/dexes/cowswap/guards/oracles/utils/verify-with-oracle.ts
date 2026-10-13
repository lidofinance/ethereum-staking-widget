import type { PublicClient } from 'viem';

import { AggregatorAbi } from 'abi/aggregator-abi';
import { WstethABI } from '@lidofinance/lido-ethereum-sdk/wrap';

import { safeParseDecimal } from '../../utils';

import {
  CHAINLINK_FEEDS,
  CHAINLINK_SCALE,
  WSTETH_SCALE,
  WSTETH_RATE_MIN,
  WSTETH_RATE_MAX,
  WSTETH_ADDRESS,
  type ChainlinkFeedKey,
} from '../feeds';
import { PARTNER_FEE_PCT, FAIL_UNSUPPORTED, FAIL_UNAVAILABLE } from '../consts';
import type { OnTradeParamsPayload, OracleResult } from '../types';

import { isValidRound, isInBounds, type RoundData } from './rounds';

export type OracleClient = Pick<PublicClient, 'readContract'>;

/** Lowercased mainnet token address → Chainlink USD feed. */
export type TokenFeedMap = Record<string, ChainlinkFeedKey>;

export type OracleFeedMaps = {
  sell: TokenFeedMap;
  buy: TokenFeedMap;
};

export const verifyWithOracle = async (
  client: OracleClient | undefined,
  params: OnTradeParamsPayload,
  feedMaps: OracleFeedMaps,
): Promise<OracleResult> => {
  if (!client) return FAIL_UNAVAILABLE;

  const sellAddr = params.sellToken?.address.toLowerCase();
  const buyAddr = params.buyToken?.address.toLowerCase();
  if (!sellAddr || !buyAddr) return FAIL_UNSUPPORTED;

  const sellFeedKey = feedMaps.sell[sellAddr];
  const buyFeedKey = feedMaps.buy[buyAddr];
  if (!sellFeedKey || !buyFeedKey) return FAIL_UNSUPPORTED;

  const sellFeed = CHAINLINK_FEEDS[sellFeedKey];
  const buyFeed = CHAINLINK_FEEDS[buyFeedKey];
  if (!sellFeed || !buyFeed) return FAIL_UNSUPPORTED;

  try {
    const isWsteth = sellAddr === WSTETH_ADDRESS;

    // Individual readContract calls — Multicall3 is not in /api/rpc allowlist
    const [sellRoundData, buyRoundData, wstethRate] = await Promise.all([
      client.readContract({
        address: sellFeed.address,
        abi: AggregatorAbi,
        functionName: 'latestRoundData',
      }) as Promise<RoundData>,
      client.readContract({
        address: buyFeed.address,
        abi: AggregatorAbi,
        functionName: 'latestRoundData',
      }) as Promise<RoundData>,
      isWsteth
        ? client.readContract({
            address: WSTETH_ADDRESS,
            abi: WstethABI,
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
    const buyUnits = safeParseDecimal(params.buyTokenAmount?.units?.toString());

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
};
