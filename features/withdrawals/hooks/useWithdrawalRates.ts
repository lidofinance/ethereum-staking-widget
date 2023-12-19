import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { BigNumber } from 'ethers';

import { Zero } from '@ethersproject/constants';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import { useLidoSWR } from '@lido-sdk/react';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { standardFetcher } from 'utils/standardFetcher';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

import { RequestFormInputType } from '../request/request-form-context';
import { formatEther } from '@ethersproject/units';

type getWithdrawalRatesParams = {
  amount: BigNumber;
  token: TOKENS.STETH | TOKENS.WSTETH;
};

type RateResult = {
  name: string;
  rate: number | null;
  toReceive: BigNumber | null;
};

type GetRateType = (
  amount: BigNumber,
  token: TOKENS.STETH | TOKENS.WSTETH,
) => Promise<RateResult>;

type rateCalculationResult = ReturnType<typeof calculateRateReceive>;

type getWithdrawalRatesResult = RateResult[];

const RATE_PRECISION = 100000;
const RATE_PRECISION_BN = BigNumber.from(RATE_PRECISION);

const calculateRateReceive = (
  amount: BigNumber,
  src: BigNumber,
  dest: BigNumber,
) => {
  const _rate = dest.mul(RATE_PRECISION_BN).div(src);
  const toReceive = amount.mul(dest).div(src);
  const rate = _rate.toNumber() / RATE_PRECISION;
  return { rate, toReceive };
};

type OpenOceanGetGasPartial = {
  without_decimals: {
    standard: {
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

const getOpenOceanRate: GetRateType = async (amount, token) => {
  let rateInfo: rateCalculationResult | null = null;

  try {
    if (amount.isZero() || amount.isNegative()) {
      return {
        name: 'openOcean',
        rate: 0,
        toReceive: BigNumber.from(0),
      };
    }

    const basePath = 'https://open-api.openocean.finance/v3/1';
    const gasData = await standardFetcher<OpenOceanGetGasPartial>(
      `${basePath}/gasPrice`,
    );

    const params = new URLSearchParams({
      inTokenSymbol: token,
      inTokenAddress: getTokenAddress(CHAINS.Mainnet, token),
      outTokenSymbol: 'ETH',
      outTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      gasPrice: gasData.without_decimals.standard.legacyGasPrice,
      amount: formatEther(amount),
    });

    const quote = await standardFetcher<OpenOceanGetQuotePartial>(
      `${basePath}/quote?${params.toString()}`,
    );

    rateInfo = calculateRateReceive(
      amount,
      BigNumber.from(quote.data.inAmount),
      BigNumber.from(quote.data.outAmount),
    );
  } catch (e) {
    console.warn('[getOpenOceanRate] Failed to receive withdraw rate', e);
  }

  return {
    name: 'openOcean',
    rate: rateInfo?.rate ?? null,
    toReceive: rateInfo?.toReceive ?? null,
  };
};

const getWithdrawalRates = async ({
  amount,
  token,
}: getWithdrawalRatesParams): Promise<getWithdrawalRatesResult> => {
  const rates = await Promise.all([getOpenOceanRate(amount, token)]);

  if (rates.length > 1) {
    // sort by rate, then alphabetic
    rates.sort((r1, r2) => {
      const rate1 = r1.rate ?? 0;
      const rate2 = r2.rate ?? 0;
      if (rate1 == rate2) {
        if (r1.name < r2.name) {
          return -1;
        }
        if (r1.name > r2.name) {
          return 1;
        }
        return 0;
      }
      return rate2 - rate1;
    });
  }

  return rates;
};

type useWithdrawalRatesOptions = {
  fallbackValue?: BigNumber;
};

export const useWithdrawalRates = ({
  fallbackValue = Zero,
}: useWithdrawalRatesOptions = {}) => {
  const [token, amount] = useWatch<RequestFormInputType, ['token', 'amount']>({
    name: ['token', 'amount'],
  });
  const fallbackedAmount = amount ?? fallbackValue;
  const debouncedAmount = useDebouncedValue(fallbackedAmount, 1000);
  const swr = useLidoSWR(
    ['swr:withdrawal-rates', debouncedAmount, token],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_, amount, token) =>
      getWithdrawalRates({
        amount: amount as BigNumber,
        token: token as TOKENS.STETH | TOKENS.WSTETH,
      }),
    {
      ...STRATEGY_LAZY,
      isPaused: () => !debouncedAmount || !debouncedAmount._isBigNumber,
    },
  );

  const bestRate = useMemo(() => {
    return swr.data?.[0]?.rate ?? null;
  }, [swr.data]);

  return {
    amount: fallbackedAmount,
    bestRate,
    selectedToken: token,
    data: swr.data,
    get initialLoading() {
      return swr.initialLoading || !debouncedAmount.eq(fallbackedAmount);
    },
    get loading() {
      return swr.loading || !debouncedAmount.eq(fallbackedAmount);
    },
    get error() {
      return swr.error;
    },
    update: swr.update,
  };
};
