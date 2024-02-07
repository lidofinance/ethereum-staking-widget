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

  const asyncContextValue: WrapFormAsyncValidationContext | undefined =
    useMemo(() => {
      if (
        stethBalance &&
        ethBalance &&
        isMultisig !== undefined &&
        wrapEthGasCost &&
        stakeLimitInfo
      )
        return {
          stethBalance,
          etherBalance: ethBalance,
          isMultisig,
          gasCost: wrapEthGasCost,
          stakingLimitLevel: stakeLimitInfo.stakeLimitLevel,
          currentStakeLimit: stakeLimitInfo.currentStakeLimit,
        };
      else return undefined;
    }, [ethBalance, isMultisig, stakeLimitInfo, stethBalance, wrapEthGasCost]);

  const asyncContext = useAwaiter(asyncContextValue).awaiter;
  return {
    isWalletActive: active,
    asyncContext,
  };
};
