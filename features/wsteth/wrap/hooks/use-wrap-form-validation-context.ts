import { useMemo } from 'react';
import { useAA, useDappStatus, useLidoSDKL2 } from 'modules/web3';
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
  const { areAuxiliaryFundsSupported } = useAA();
  const { isL2 } = useLidoSDKL2();

  const {
    stakeLimitInfo,
    ethBalance,
    stethBalance,
    isSmartAccount,
    wrapEthGasCost,
  } = networkData;

  const waitForAccountData = isDappActive
    ? stethBalance !== undefined &&
      ethBalance !== undefined &&
      isSmartAccount !== undefined
    : true;

  const isDataReady = !!(
    waitForAccountData &&
    wrapEthGasCost &&
    // L2 dont't have stakeLimitInfo
    (isL2 || stakeLimitInfo)
  );

  const asyncContextValue: WrapFormAsyncValidationContext | undefined =
    useMemo(() => {
      return isDataReady
        ? ({
            isWalletActive: isDappActive,
            stethBalance,
            etherBalance: ethBalance,
            isSmartAccount,
            gasCost: wrapEthGasCost,
            shouldValidateEtherBalance: !areAuxiliaryFundsSupported,
            stakingLimitLevel: stakeLimitInfo?.stakeLimitLevel,
            currentStakeLimit: stakeLimitInfo?.currentStakeLimit,
          } as WrapFormAsyncValidationContext)
        : undefined;
    }, [
      isDataReady,
      isDappActive,
      stethBalance,
      ethBalance,
      isSmartAccount,
      wrapEthGasCost,
      areAuxiliaryFundsSupported,
      stakeLimitInfo?.stakeLimitLevel,
      stakeLimitInfo?.currentStakeLimit,
    ]);

  const asyncContext = useAwaiter(asyncContextValue).awaiter;
  return {
    asyncContext,
  };
};
