import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { TOKENS } from '@lido-sdk/constants';
import { useLidoSWR } from '@lido-sdk/react';

import { ZERO } from 'modules/web3';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';

import type { RequestFormInputType } from '../request-form-context';
import { getDexConfig } from './integrations';

import type {
  DexWithdrawalApi,
  GetWithdrawalRateParams,
  GetWithdrawalRateResult,
} from './types';
import { useConfig } from 'config';

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
  const swr = useLidoSWR(
    ['swr:withdrawal-rates', debouncedAmount.toString(), token, enabledDexes],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_, amount, token, enabledDexes) =>
      getWithdrawalRates({
        // TODO: NEW SDK
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        amount: amount as unknown as bigint,
        token: token as TOKENS.STETH | TOKENS.WSTETH,
        dexes: enabledDexes as DexWithdrawalApi[],
      }),
    {
      ...STRATEGY_LAZY,
      isPaused: () =>
        isPaused ||
        !debouncedAmount ||
        typeof debouncedAmount !== 'bigint' ||
        enabledDexes.length === 0,
    },
  );

  const bestRate = useMemo(() => {
    return swr.data?.[0]?.rate ?? null;
  }, [swr.data]);

  return {
    amount: fallbackedAmount,
    bestRate,
    enabledDexes,
    selectedToken: token,
    data: swr.data,
    get initialLoading() {
      return swr.initialLoading || debouncedAmount !== fallbackedAmount;
    },
    get loading() {
      return swr.loading || debouncedAmount !== fallbackedAmount;
    },
    get error() {
      return swr.error;
    },
    update: swr.update,
  };
};
