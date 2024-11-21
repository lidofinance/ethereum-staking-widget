import { useStETHByWstETH, useWstethBySteth } from 'modules/web3';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';

export const useDebouncedWstethBySteth = (
  amount?: bigint | null,
  delay = 500,
) => {
  const fallbackedAmount = amount ?? BigInt(0);
  const amountDebounced = useDebouncedValue(fallbackedAmount, delay);
  const isActualValue = fallbackedAmount === amountDebounced;

  const { data, initialLoading, loading, error, refetch } = useWstethBySteth(
    isActualValue ? amountDebounced : null,
  );

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
      return refetch;
    },
  };
};

export const useDebouncedStethByWsteth = (
  amount?: bigint | null,
  delay = 500,
) => {
  const fallbackedAmount = amount ?? BigInt(0);
  const amountDebounced = useDebouncedValue(fallbackedAmount, delay);
  const isActualValue = fallbackedAmount === amountDebounced;

  const { data, initialLoading, loading, error, refetch } = useStETHByWstETH(
    isActualValue ? amountDebounced : null,
  );

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
      return refetch;
    },
  };
};
