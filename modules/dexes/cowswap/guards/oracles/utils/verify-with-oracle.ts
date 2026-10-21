import type { PublicClient } from 'viem';

import { AggregatorAbi } from 'abi/aggregator-abi';
import { WstethABI } from '@lidofinance/lido-ethereum-sdk/wrap';

import { safeParseDecimal } from '../../utils';

import {
  CHAINLINK_FEEDS,
  CHAINLINK_SCALE,
  ORACLE_PRICES,
  WSTETH_SCALE,
  WSTETH_RATE_MIN,
  WSTETH_RATE_MAX,
  WSTETH_ADDRESS,
  WSTETH_PRICE_KEY,
  type OraclePriceKey,
} from '../feeds';
import { PARTNER_FEE_PCT, FAIL_UNSUPPORTED, FAIL_UNAVAILABLE } from '../consts';
import type { OnTradeParamsPayload, OracleResult } from '../types';

import { isValidRound, isInBounds, type RoundData } from './rounds';

export type OracleClient = Pick<PublicClient, 'readContract'>;

/** Lowercased mainnet token address → Chainlink USD price. */
export type TokenFeedMap = Record<string, OraclePriceKey>;

export type OracleFeedMaps = {
  sell: TokenFeedMap;
  buy: TokenFeedMap;
};

// USD price with 8 decimals, null on invalid or out-of-bounds round
const readUsdPrice = async (
  client: OracleClient,
  priceKey: OraclePriceKey,
  nowSec: bigint,
): Promise<bigint | null> => {
  const feedKeys = ORACLE_PRICES[priceKey];
  const rounds = await Promise.all(
    feedKeys.map(
      (key) =>
        client.readContract({
          address: CHAINLINK_FEEDS[key].address,
          abi: AggregatorAbi,
          functionName: 'latestRoundData',
        }) as Promise<RoundData>,
    ),
  );

  let numerator = CHAINLINK_SCALE;
  let denominator = 1n;
  for (const [index, key] of feedKeys.entries()) {
    const feed = CHAINLINK_FEEDS[key];
    const roundData = rounds[index];
    if (!roundData || !isValidRound(roundData, feed.maxStaleness, nowSec))
      return null;

    if (!isInBounds(roundData[1], key)) return null;

    numerator *= roundData[1];
    denominator *= 10n ** BigInt(feed.decimals);
  }

  return numerator / denominator;
};

// USD price of one token unit with 8 decimals; wstETH via stEthPerToken
const readTokenUsdPrice = async (
  client: OracleClient,
  priceKey: OraclePriceKey,
  nowSec: bigint,
): Promise<bigint | null> => {
  const isWsteth = priceKey === WSTETH_PRICE_KEY;

  // Individual readContract calls — Multicall3 is not in /api/rpc allowlist
  const [usdPrice, wstethRate] = await Promise.all([
    readUsdPrice(client, priceKey, nowSec),
    isWsteth
      ? client.readContract({
          address: WSTETH_ADDRESS,
          abi: WstethABI,
          functionName: 'stEthPerToken',
        })
      : Promise.resolve(null),
  ] as const);

  if (usdPrice === null) return null;
  if (!isWsteth) return usdPrice;

  if (wstethRate == null) return null;
  if (wstethRate < WSTETH_RATE_MIN || wstethRate > WSTETH_RATE_MAX) return null;

  return (usdPrice * wstethRate) / WSTETH_SCALE;
};

const toUsdNumber = (price: bigint) => Number(price) / Number(CHAINLINK_SCALE);

// USD price of one sell token unit, null if unsupported or unavailable
export const readSellTokenUsd = async (
  client: OracleClient | undefined,
  params: OnTradeParamsPayload,
  feedMaps: OracleFeedMaps,
): Promise<number | null> => {
  const sellAddr = params.sellToken?.address.toLowerCase();
  if (!client || !sellAddr) return null;

  const priceKey = feedMaps.sell[sellAddr];
  if (!priceKey || !ORACLE_PRICES[priceKey]) return null;

  try {
    const nowSec = BigInt(Math.floor(Date.now() / 1000));
    const price = await readTokenUsdPrice(client, priceKey, nowSec);

    return price === null ? null : toUsdNumber(price);
  } catch {
    return null;
  }
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

  const sellPriceKey = feedMaps.sell[sellAddr];
  const buyPriceKey = feedMaps.buy[buyAddr];
  if (!sellPriceKey || !buyPriceKey) return FAIL_UNSUPPORTED;
  if (!ORACLE_PRICES[sellPriceKey] || !ORACLE_PRICES[buyPriceKey])
    return FAIL_UNSUPPORTED;

  try {
    const nowSec = BigInt(Math.floor(Date.now() / 1000));
    const [sellPrice, buyPrice] = await Promise.all([
      readTokenUsdPrice(client, sellPriceKey, nowSec),
      readTokenUsdPrice(client, buyPriceKey, nowSec),
    ]);

    if (sellPrice === null || buyPrice === null) return FAIL_UNAVAILABLE;

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

    const sellTokenUsd = toUsdNumber(sellPrice);
    const buyTokenUsd = toUsdNumber(buyPrice);
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
