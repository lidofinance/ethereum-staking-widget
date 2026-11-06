import type { PublicClient } from 'viem';

import { SLIPPAGE_TOTAL_BPS } from '../../../consts';
import { safeParseDecimal } from '../../utils';

import { NETWORK_COST_ALLOWANCE } from '../consts';
import { ORACLE_PRICES } from '../feeds';
import type { OnTradeParamsPayload } from '../types';

import {
  readTokenUsdPrice,
  toUsdNumber,
  type OracleClient,
  type OracleFeedMaps,
} from './verify-with-oracle';

export type NetworkCostClient = OracleClient &
  Pick<PublicClient, 'getGasPrice'>;

export type NetworkCostChain = { isMainnet: boolean; isTestnet: boolean };

// allowance for the CoW network cost in buy token units; 0 when it cannot be priced, so the check stays strict
export const readNetworkCostAllowance = async (
  client: NetworkCostClient | undefined,
  params: OnTradeParamsPayload,
  feedMaps: OracleFeedMaps,
  { isMainnet, isTestnet }: NetworkCostChain,
): Promise<number> => {
  const buyUnits = safeParseDecimal(params.buyTokenAmount?.units?.toString());
  if (buyUnits === null || buyUnits <= 0) return 0;

  const config =
    isMainnet || isTestnet
      ? NETWORK_COST_ALLOWANCE.mainnet
      : NETWORK_COST_ALLOWANCE.l2;
  const shareUnits = (buyUnits * config.maxShareBps) / SLIPPAGE_TOTAL_BPS;
  // no oracle on testnets
  if (isTestnet) return shareUnits;

  const buyAddr = params.buyToken?.address.toLowerCase();
  const buyPriceKey = buyAddr && feedMaps.buy[buyAddr];
  if (!client || !buyPriceKey || !ORACLE_PRICES[buyPriceKey]) return 0;

  try {
    const nowSec = BigInt(Math.floor(Date.now() / 1000));
    const [buyPrice, gasPrice, ethPrice] = await Promise.all([
      readTokenUsdPrice(client, buyPriceKey, nowSec),
      isMainnet ? client.getGasPrice() : Promise.resolve(null),
      isMainnet ? readTokenUsdPrice(client, 'ETH_USD', nowSec) : null,
    ]);
    if (buyPrice === null) return 0;

    let maxUsd: number = config.maxUsd;
    if (isMainnet) {
      if (gasPrice === null || ethPrice === null) return 0;
      const { maxGasUnits, gasPriceMultiplier } =
        NETWORK_COST_ALLOWANCE.mainnet;
      const gasEth =
        Number(gasPrice * BigInt(maxGasUnits * gasPriceMultiplier)) / 1e18;
      maxUsd = Math.min(maxUsd, gasEth * toUsdNumber(ethPrice));
    }

    return Math.min(shareUnits, maxUsd / toUsdNumber(buyPrice));
  } catch {
    return 0;
  }
};
