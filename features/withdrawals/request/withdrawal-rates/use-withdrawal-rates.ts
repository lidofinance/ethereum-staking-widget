import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { BigNumber } from 'ethers';

import { Zero } from '@ethersproject/constants';
import { TOKENS } from '@lido-sdk/constants';
import { useLidoSWR } from '@lido-sdk/react';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

import type { RequestFormInputType } from '../request-form-context';
import { getWithdrawalRates } from './get-withdrawal-rates';

import { ENABLED_WITHDRAWAL_DEXES } from 'features/withdrawals/withdrawals-constants';

export type useWithdrawalRatesOptions = {
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
        dexes: ENABLED_WITHDRAWAL_DEXES,
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
