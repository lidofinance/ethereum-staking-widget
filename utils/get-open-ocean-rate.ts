import { formatEther } from 'viem';

import { TOKENS, getTokenAddress } from 'config/networks/token-address';
import { standardFetcher } from './standardFetcher';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

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

type RateCalculationResult = { rate: number; toReceive: bigint };

// To be exported when more integrations appear
const RATE_PRECISION = 100000;
const RATE_PRECISION_BIG_INT = BigInt(RATE_PRECISION);

const calculateRateReceive = (
  amount: bigint,
  fromAmount: bigint,
  toAmount: bigint,
): RateCalculationResult => {
  const _rate = (toAmount * RATE_PRECISION_BIG_INT) / fromAmount;
  const rate = Number(_rate) / RATE_PRECISION;
  // if original amount is capped
  const toReceive =
    amount === fromAmount ? toAmount : (amount * toAmount) / fromAmount;
  return { rate, toReceive };
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
