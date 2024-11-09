import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import { standardFetcher } from './standardFetcher';
import { formatEther } from '@ethersproject/units';

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

type RateToken = TOKENS.STETH | TOKENS.WSTETH | 'ETH';

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

const getRateTokenAddress = (token: RateToken) =>
  token === 'ETH'
    ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    : getTokenAddress(CHAINS.Mainnet, token);

export const getOpenOceanRate = async (
  amount: bigint,
  fromToken: RateToken,
  toToken: RateToken,
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
