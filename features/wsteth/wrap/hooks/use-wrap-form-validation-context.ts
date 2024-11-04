import { useMemo } from 'react';
import { useDappStatus } from 'modules/web3';
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
  const { isDappActive } = useDappStatus();
  const {
    stakeLimitInfo,
    ethBalance,
    stethBalance,
    isMultisig,
    wrapEthGasCost,
  } = networkData;

  const waitForAccountData = isDappActive
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
            isWalletActive: isDappActive,
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
      isDappActive,
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
