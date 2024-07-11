import { useMemo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useAwaiter } from 'shared/hooks/use-awaiter';

import type {
  WrapFormNetworkData,
  WrapFormAsyncValidationContext,
  WrapFormValidationContext,
} from '../wrap-form-context';

type UseWrapFormValidationContextArgs = {
  networkData: WrapFormNetworkData;
};

export const useWrapFormValidationContext = ({
  networkData,
}: UseWrapFormValidationContextArgs): WrapFormValidationContext => {
  const { active } = useWeb3();
  const {
    stakeLimitInfo,
    ethBalance,
    stethBalance,
    isMultisig,
    wrapEthGasCost,
  } = networkData;

  const waitForAccountData = active
    ? stethBalance && ethBalance && isMultisig !== undefined
    : true;

  const isDataReady = !!(
    waitForAccountData &&
    wrapEthGasCost &&
    stakeLimitInfo
  );

  const asyncContextValue: WrapFormAsyncValidationContext | undefined =
    useMemo(() => {
      return isDataReady
        ? ({
            isWalletActive: active,
            stethBalance,
            etherBalance: ethBalance,
            isMultisig,
            gasCost: wrapEthGasCost,
            stakingLimitLevel: stakeLimitInfo?.stakeLimitLevel,
            currentStakeLimit: stakeLimitInfo?.currentStakeLimit,
          } as WrapFormAsyncValidationContext)
        : undefined;
    }, [
      isDataReady,
      active,
      stethBalance,
      ethBalance,
      isMultisig,
      wrapEthGasCost,
      stakeLimitInfo?.stakeLimitLevel,
      stakeLimitInfo?.currentStakeLimit,
    ]);

  const asyncContext = useAwaiter(asyncContextValue).awaiter;
  return {
    asyncContext,
  };
};
