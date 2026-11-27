import { useMemo } from 'react';

import { useAA, useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';

import { isAtomicBatchSupported, type FormRoutingConfig } from '../../../utils';

import { resolveStakeRoute } from './registry';
import type {
  StakeAccountEnvironment,
  StakeRouteSpec,
  StakeRouteSubmitTools,
} from './types';
import { useGetL2StakeState } from './use-get-l2-stake-state';

/** account, capabilities by chain, per-chain fast stake state */
const useStakeAccountEnvironment = (): StakeAccountEnvironment | null => {
  const { address: account } = useDappStatus();
  // raw, by chain: AA is resolved for tokenIn's chain, not the dapp chain
  const { data: capabilities } = useAA();
  const getL2StakeState = useGetL2StakeState();
  return useMemo(
    () => (account ? { account, capabilities, getL2StakeState } : null),
    [account, capabilities, getL2StakeState],
  );
};

/** hook-backed tools for submit: routes cannot call hooks */
const useStakeSubmitTools = (): StakeRouteSubmitTools | null => {
  const { address: account } = useDappStatus();
  const txFlow = useTxFlow();
  const lidoSDK = useLidoSDK();
  return useMemo(
    () => (account ? { account, txFlow, lidoSDK } : null),
    [account, txFlow, lidoSDK],
  );
};

/** how the stake form reaches its routes; see useFormRouting */
export const stakeRouting: FormRoutingConfig<
  StakeRouteSpec,
  StakeAccountEnvironment
> = {
  resolve: resolveStakeRoute,
  toPair: ({ tokenIn, tokenOut }) => ({ tokenIn, tokenOut }),
  getAmount: ({ amount }) => amount,
  useEnvironment: useStakeAccountEnvironment,
  useSubmitTools: useStakeSubmitTools,
  toDeps: (pair, environment) => ({
    ...pair,
    ...environment,
    isAA: isAtomicBatchSupported(
      environment.capabilities,
      pair.tokenIn.chainId,
    ),
  }),
  toQuoteDeps: (pair, environment) => ({ ...pair, ...environment }),
};
