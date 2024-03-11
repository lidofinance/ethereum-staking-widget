import { Zero } from '@ethersproject/constants';
import type { BigNumber } from 'ethers';
import { useStethByWsteth } from 'shared/hooks';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useWstethBySteth } from 'shared/hooks/useWstethBySteth';

export const useDebouncedWstethBySteth = (
  amount: BigNumber | null,
  delay = 500,
) => {
  const fallbackedAmount = amount ?? Zero;
  const amountDebounced = useDebouncedValue(fallbackedAmount, delay);
  const swr = useWstethBySteth(amountDebounced ?? undefined);
  const isActualValue = fallbackedAmount.eq(amountDebounced);
  return {
    get data() {
      return isActualValue ? swr.data : undefined;
    },
    get initialLoading() {
      return isActualValue ? swr.initialLoading : true;
    },
    get loading() {
      return swr.loading;
    },
    get error() {
      return swr.error;
    },
    get update() {
      return swr.update;
    },
  };
};

export const useDebouncedStethByWsteth = (
  amount: BigNumber | null,
  delay = 500,
) => {
  const fallbackedAmount = amount ?? Zero;
  const amountDebounced = useDebouncedValue(fallbackedAmount, delay);
  const swr = useStethByWsteth(amountDebounced ?? undefined);
  const isActualValue = fallbackedAmount.eq(amountDebounced);
  return {
    get data() {
      return isActualValue ? swr.data : undefined;
    },
    get initialLoading() {
      return isActualValue ? swr.initialLoading : true;
    },
    get loading() {
      return swr.loading;
    },
    get error() {
      return swr.error;
    },
    get update() {
      return swr.update;
    },
  };
};
