import { useEstimateFeesPerGas } from 'wagmi';
import { BigNumber } from 'ethers';

export const useMaxGasPrice = () => {
  const { data, isLoading, error, isFetching, refetch } =
    useEstimateFeesPerGas();

  return {
    get maxGasPrice() {
      return data ? BigNumber.from(data.maxFeePerGas) : undefined;
    },
    get initialLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get loading() {
      return isFetching;
    },
    update() {
      return refetch();
    },
  };
};
