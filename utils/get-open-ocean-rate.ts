import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';
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

type RateCalculationResult = { rate: number; toReceive: BigNumber };

// To be exported when more integrations appear
const RATE_PRECISION = 100000;
const RATE_PRECISION_BN = BigNumber.from(RATE_PRECISION);

const calculateRateReceive = (
  amount: BigNumber,
  fromAmount: BigNumber,
  toAmount: BigNumber,
): RateCalculationResult => {
  const _rate = toAmount.mul(RATE_PRECISION_BN).div(fromAmount);
  const rate = _rate.toNumber() / RATE_PRECISION;
  // if original amount is capped
  const toReceive = amount.eq(fromAmount)
    ? toAmount
    : amount.mul(toAmount).div(fromAmount);
  return { rate, toReceive };
};

const getRateTokenAddress = (token: RateToken) =>
  token === 'ETH'
    ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    : getTokenAddress(CHAINS.Mainnet, token);

export const getOpenOceanRate = async (
  amount: BigNumber,
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
    BigNumber.from(quote.data.inAmount),
    BigNumber.from(quote.data.outAmount),
  );
};
