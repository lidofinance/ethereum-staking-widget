import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { BigNumber } from 'ethers';
import { Zero } from '@ethersproject/constants';
import { TOKENS } from '@lido-sdk/constants';
import { useLidoSWR } from '@lido-sdk/react';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

import type { RequestFormInputType } from '../request-form-context';
import { getDexConfig } from './integrations';

import { ENABLED_WITHDRAWAL_DEXES } from 'features/withdrawals/withdrawals-constants';

import type { GetWithdrawalRateParams, GetWithdrawalRateResult } from './types';

export type useWithdrawalRatesOptions = {
  fallbackValue?: BigNumber;
};

export const getWithdrawalRates = async (
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
  fallbackValue = Zero,
}: useWithdrawalRatesOptions = {}) => {
  const [token, amount] = useWatch<RequestFormInputType, ['token', 'amount']>({
    name: ['token', 'amount'],
  });
  const fallbackedAmount = amount ?? fallbackValue;
  const debouncedAmount = useDebouncedValue(fallbackedAmount, 1000);
  const swr = useLidoSWR(
    ['swr:withdrawal-rates', debouncedAmount.toString(), token],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_, amount, token) =>
      getWithdrawalRates({
        amount: BigNumber.from(amount),
        token: token as TOKENS.STETH | TOKENS.WSTETH,
        dexes: ENABLED_WITHDRAWAL_DEXES,
      }),
    {
      ...STRATEGY_LAZY,
      isPaused: () =>
        !debouncedAmount ||
        !debouncedAmount._isBigNumber ||
        ENABLED_WITHDRAWAL_DEXES.length === 0,
    },
  );

  const bestRate = useMemo(() => {
    return swr.data?.[0]?.rate ?? null;
  }, [swr.data]);

  return {
    amount: fallbackedAmount,
    bestRate,
    enabledDexes: ENABLED_WITHDRAWAL_DEXES,
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
