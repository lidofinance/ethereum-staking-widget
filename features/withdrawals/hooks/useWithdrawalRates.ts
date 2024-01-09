import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { BigNumber } from 'ethers';

import { Zero } from '@ethersproject/constants';
import { TOKENS } from '@lido-sdk/constants';
import { useLidoSWR } from '@lido-sdk/react';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

import { RequestFormInputType } from '../request/request-form-context';
import { getOpenOceanRate } from 'utils/get-open-ocean-rate';

type GetWithdrawalRateParams = {
  amount: BigNumber;
  token: TOKENS.STETH | TOKENS.WSTETH;
};

type SingleWithdrawalRateResult = {
  name: string;
  rate: number | null;
  toReceive: BigNumber | null;
};

type GetRateType = (
  params: GetWithdrawalRateParams,
) => Promise<SingleWithdrawalRateResult>;

type GetWithdrawalRateResult = SingleWithdrawalRateResult[];

const getOpenOceanWithdrawalRate: GetRateType = async ({ amount, token }) => {
  try {
    const rate = await getOpenOceanRate(amount, token, 'ETH');
    return {
      name: 'openOcean',
      ...rate,
    };
  } catch (e) {
    console.warn('[getOpenOceanRate] Failed to receive withdraw rate', e);
  }

  return {
    name: 'openOcean',
    rate: null,
    toReceive: null,
  };
};

const getWithdrawalRates = async (
  params: GetWithdrawalRateParams,
): Promise<GetWithdrawalRateResult> => {
  const rates = await Promise.all([getOpenOceanWithdrawalRate(params)]);

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
