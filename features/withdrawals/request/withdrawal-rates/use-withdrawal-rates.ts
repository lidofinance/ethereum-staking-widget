import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import { useConfig } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { ZERO } from 'modules/web3';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';

import type { RequestFormInputType } from '../request-form-context';

import { getDexConfig } from './integrations';
import type { GetWithdrawalRateParams, GetWithdrawalRateResult } from './types';

export type useWithdrawalRatesOptions = {
  fallbackValue?: bigint;
  isPaused?: boolean;
};

const getWithdrawalRates = async (
  params: GetWithdrawalRateParams,
): Promise<GetWithdrawalRateResult> => {
  const rates = await Promise.all(
    params.dexes.map((dexKey) => {
      const dex = getDexConfig(dexKey);
      return dex.fetcher(params).then((result) => ({
        ...dex,
        ...result,
      }));
    }),
  );

  if (rates.length > 1) {
    // sort by rate, then alphabetic
    rates.sort((r1, r2) => {
      const rate1 = r1.rate ?? 0;
      const rate2 = r2.rate ?? 0;
      if (rate1 == rate2) {
        return r1.title.toLowerCase() > r2.title.toLowerCase() ? 1 : -1;
      }
      return rate2 - rate1;
    });
  }

  return rates;
};

export const useWithdrawalRates = ({
  fallbackValue = ZERO,
  isPaused,
}: useWithdrawalRatesOptions = {}) => {
  const [token, amount] = useWatch<RequestFormInputType, ['token', 'amount']>({
    name: ['token', 'amount'],
  });
  const enabledDexes = useConfig().externalConfig.enabledWithdrawalDexes;
  const fallbackedAmount = amount ?? fallbackValue;
  const debouncedAmount = useDebouncedValue(fallbackedAmount, 1000);

  const queryResult = useQuery({
    queryKey: [
      'withdrawal-rates',
      debouncedAmount.toString(),
      token,
      enabledDexes,
    ],
    ...STRATEGY_LAZY,
    enabled:
      !isPaused &&
      !!debouncedAmount &&
      typeof debouncedAmount === 'bigint' &&
      enabledDexes.length > 0,
    queryFn: () =>
      getWithdrawalRates({
        amount: debouncedAmount,
        token,
        dexes: enabledDexes,
      }),
  });

  const bestRate = useMemo(() => {
    return queryResult.data?.[0]?.rate ?? null;
  }, [queryResult.data]);

  return {
    amount: fallbackedAmount,
    bestRate,
    enabledDexes,
    selectedToken: token,
    data: queryResult.data,
    get isLoading() {
      return queryResult.isLoading || debouncedAmount !== fallbackedAmount;
    },
    get isFetching() {
      return queryResult.isFetching || debouncedAmount !== fallbackedAmount;
    },
    get error() {
      return queryResult.error;
    },
    update: queryResult.refetch,
  };
};
