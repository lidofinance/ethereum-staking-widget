import { TOKENS, CHAINS, getTokenAddress } from '@lido-sdk/constants';
import { standardFetcher } from './standardFetcher';
import { formatEther } from '@ethersproject/units';
import { TOKENS_WITHDRAWABLE } from '../features/withdrawals/types/tokens-withdrawable';
import { TOKENS_WRAPPABLE } from '../features/wsteth/shared/types';

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

const getRateTokenAddress = (token: TOKENS_WITHDRAWABLE | TOKENS_WRAPPABLE) =>
  token === 'ETH'
    ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    : getTokenAddress(CHAINS.Mainnet, token as TOKENS);

export const getOpenOceanRate = async (
  amount: bigint,
  fromToken: TOKENS_WITHDRAWABLE | TOKENS_WRAPPABLE,
  toToken: TOKENS_WITHDRAWABLE | TOKENS_WRAPPABLE,
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
