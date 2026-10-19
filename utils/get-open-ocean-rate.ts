import { formatEther } from 'viem';
import { z } from 'zod';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { getTokenAddress } from 'config/networks/token-address';
import { standardFetcher } from './standardFetcher';
import { BIGINT_STRING_SCHEMA } from './zod';
import {
  calculateRateReceive,
  RateCalculationResult,
} from './calculate-rate-to-receive';
import { type Token, type TokenSymbol } from 'consts/tokens';

const OPEN_OCEAN_GAS_SCHEMA = z.object({
  without_decimals: z.object({
    standard: z.object({ maxFeePerGas: z.string() }),
  }),
});

const OPEN_OCEAN_QUOTE_SCHEMA = z.object({
  data: z.object({
    inAmount: BIGINT_STRING_SCHEMA,
    outAmount: BIGINT_STRING_SCHEMA,
  }),
});

export const getOpenOceanRate = async (
  amount: bigint,
  fromToken: Token | TokenSymbol,
  toToken: Token | TokenSymbol,
): Promise<RateCalculationResult> => {
  const basePath = 'https://open-api.openocean.finance/v3/1';
  const gasData = OPEN_OCEAN_GAS_SCHEMA.parse(
    await standardFetcher<unknown>(`${basePath}/gasPrice`),
  );

  const params = new URLSearchParams({
    inTokenAddress: getTokenAddress(CHAINS.Mainnet, fromToken) as string,
    outTokenAddress: getTokenAddress(CHAINS.Mainnet, toToken) as string,
    gasPrice: gasData.without_decimals.standard.maxFeePerGas,
    amount: formatEther(amount),
  });

  const quote = OPEN_OCEAN_QUOTE_SCHEMA.parse(
    await standardFetcher<unknown>(`${basePath}/quote?${params.toString()}`),
  );

  return calculateRateReceive(
    amount,
    BigInt(quote.data.inAmount),
    BigInt(quote.data.outAmount),
  );
};
