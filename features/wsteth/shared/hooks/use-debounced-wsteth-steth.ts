import { Zero } from '@ethersproject/constants';
import type { BigNumber } from 'ethers';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useStethByWsteth } from 'shared/hooks/useStethByWsteth';
import { useStETHByWstETHOnL2 } from 'shared/hooks/use-stETH-by-wstETH-on-l2';
import { useWstethBySteth } from 'shared/hooks/useWstethBySteth';
import { useWstETHByStETHOnL2 } from 'shared/hooks/use-wstETH-by-stETH-on-l2';

export const useDebouncedWstethBySteth = (
  amount: BigNumber | null,
  isL2 = false,
  delay = 500,
) => {
  const fallbackedAmount = amount ?? Zero;
  const amountDebounced = useDebouncedValue(fallbackedAmount, delay);
  const isActualValue = fallbackedAmount.eq(amountDebounced);

  const swrL1 = useWstethBySteth(
    !isL2 && amountDebounced ? amountDebounced : undefined,
  );
  const swrL2 = useWstETHByStETHOnL2(
    isL2 && amountDebounced ? amountDebounced : undefined,
  );

  const { data, initialLoading, loading, error, update } = isL2 ? swrL2 : swrL1;

  return {
    get data() {
      return isActualValue ? data : undefined;
    },
    get initialLoading() {
      return isActualValue ? initialLoading : true;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    get update() {
      return update;
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

  const { data, initialLoading, loading, error, update } = isL2 ? swrL2 : swrL1;

  return {
    get data() {
      return isActualValue ? data : undefined;
    },
    get initialLoading() {
      return isActualValue ? initialLoading : true;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    get update() {
      return update;
    },
  };
};
