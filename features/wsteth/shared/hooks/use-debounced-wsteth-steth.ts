import { useStETHByWstETH, useWstethBySteth } from 'modules/web3';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';

export const useDebouncedWstethBySteth = (
  amount?: bigint | null,
  delay = 500,
) => {
  const fallbackedAmount = amount ?? 0n;
  const amountDebounced = useDebouncedValue(fallbackedAmount, delay);
  const isActualValue = fallbackedAmount === amountDebounced;

  const { data, isLoading, isFetching, error, refetch } = useWstethBySteth(
    isActualValue ? amountDebounced : null,
  );

  return {
    get data() {
      return isActualValue ? data : undefined;
    },
    get isLoading() {
      return isActualValue ? isLoading : true;
    },
    get isFetching() {
      return isFetching;
    },
    get error() {
      return error;
    },
    get update() {
      return refetch;
    },
  };
};

export const useDebouncedStethByWsteth = (
  amount?: bigint | null,
  delay = 500,
) => {
  const fallbackedAmount = amount ?? 0n;
  const amountDebounced = useDebouncedValue(fallbackedAmount, delay);
  const isActualValue = fallbackedAmount === amountDebounced;

  const { data, isLoading, isFetching, error, refetch } = useStETHByWstETH(
    isActualValue ? amountDebounced : null,
  );

  return {
    get data() {
      return isActualValue ? data : undefined;
    },
    get isLoading() {
      return isActualValue ? isLoading : true;
    },
    get isFetching() {
      return isFetching;
    },
    get error() {
      return error;
    },
    get update() {
      return refetch;
    },
  };
};
