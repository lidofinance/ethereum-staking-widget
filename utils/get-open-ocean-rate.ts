import { formatEther } from 'viem';
import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk';

import { standardFetcher } from './standardFetcher';

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

// TODO: temp
type TOKENS =
  | Exclude<(typeof LIDO_TOKENS)[keyof typeof LIDO_TOKENS], 'unstETH'>
  | 'LDO';

// TODO: temp
const TOKEN_ADDRESSES: Record<TOKENS, string> = {
  stETH: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
  wstETH: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
  ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  LDO: '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
};

// TODO: temp
const getRateTokenAddress = (token: TOKENS): string => {
  return TOKEN_ADDRESSES[token] || '';
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
    inTokenAddress: getRateTokenAddress(fromToken),
    outTokenAddress: getRateTokenAddress(toToken),
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
