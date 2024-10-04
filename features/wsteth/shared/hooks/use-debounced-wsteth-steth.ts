import { Zero } from '@ethersproject/constants';
import type { BigNumber } from 'ethers';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useStethByWsteth } from 'shared/hooks/useStethByWsteth';
import { useWstethBySteth } from 'shared/hooks/useWstethBySteth';
import { useStETHByWstETHOnL2 } from 'shared/hooks/use-stETH-by-wstETH-on-l2';

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
  isL2 = false,
  delay = 500,
) => {
  const fallbackedAmount = amount ?? Zero;
  const amountDebounced = useDebouncedValue(fallbackedAmount, delay);
  const isActualValue = fallbackedAmount.eq(amountDebounced);

  const swrL1 = useStethByWsteth(amountDebounced ?? undefined);
  const swrL2 = useStETHByWstETHOnL2(
    isL2 && amountDebounced ? amountDebounced : undefined,
  );

  const swr = isL2 ? swrL2 : swrL1;

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
