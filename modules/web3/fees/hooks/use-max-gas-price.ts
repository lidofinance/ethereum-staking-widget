import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import { useDappStatus } from '../../hooks/use-dapp-status';
import { useAA } from '../../hooks/use-aa';
import { estimateMaxFee } from '../estimate';

/**
 * Upper-bound gas price for any tx on the chain, from the chain's fee model.
 * Use `useMaxTxCost` for a tx cost that also carries the tx-specific parts
 * (L1 data fee on OP-stack, the linea_estimateGas quote on Linea).
 */
export const useMaxGasPrice = (chainId?: number) => {
  const { chainId: dappChainId } = useDappStatus();
  const targetChainId = chainId || dappChainId;
  const publicClient = usePublicClient({ chainId: targetChainId });
  // an EIP-5792 wallet prices the batch itself, the SDK prices a legacy tx
  const { isAA: isWalletPriced } = useAA();

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['max-gas-price', { chainId: targetChainId, isWalletPriced }],
    enabled: !!publicClient,
    ...STRATEGY_LAZY,
    queryFn: () => {
      invariant(publicClient, 'max gas price query needs a client');
      return estimateMaxFee(publicClient, targetChainId, { isWalletPriced });
    },
  });

  return {
    get maxGasPrice() {
      return data?.maxFeePerGas;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get isFetching() {
      return isFetching;
    },
    update() {
      return refetch();
    },
  };
};
