import { formatEther } from 'viem';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { TOKENS, getTokenAddress } from 'config/networks/token-address';
import { standardFetcher } from './standardFetcher';
import {
  calculateRateReceive,
  RateCalculationResult,
} from './calculate-rate-to-receive';

type OpenOceanGetGasPartial = {
  without_decimals: {
    standard: {
      maxFeePerGas: string;
      legacyGasPrice: string;
    };
  };
};

type OpenOceanGetQuotePartial = {
  data: {
    inToken: {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
    };
    outToken: {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
    };
    inAmount: string;
    outAmount: string;
  };
};

export const getOpenOceanRate = async (
  amount: bigint,
  fromToken: TOKENS,
  toToken: TOKENS,
): Promise<RateCalculationResult> => {
  const basePath = 'https://open-api.openocean.finance/v3/1';
  const gasData = await standardFetcher<OpenOceanGetGasPartial>(
    `${basePath}/gasPrice`,
  );

  const params = new URLSearchParams({
    inTokenAddress: getTokenAddress(CHAINS.Mainnet, fromToken) as string,
    outTokenAddress: getTokenAddress(CHAINS.Mainnet, toToken) as string,
    gasPrice: gasData.without_decimals.standard.maxFeePerGas,
    amount: formatEther(amount),
  });

  const quote = await standardFetcher<OpenOceanGetQuotePartial>(
    `${basePath}/quote?${params.toString()}`,
  );

  return calculateRateReceive(
    amount,
    BigInt(quote.data.inAmount),
    BigInt(quote.data.outAmount),
  );
};
