import { useMemo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useAwaiter } from 'shared/hooks/use-awaiter';

import type {
  WrapFormNetworkData,
  WrapFormValidationContext,
} from '../wrap-form-context';

type UseWrapFormValidationContextArgs = {
  networkData: WrapFormNetworkData;
};

export const useWrapFormValidationContext = ({
  networkData,
}: UseWrapFormValidationContextArgs) => {
  const { active } = useWeb3();
  const { maxAmountETH, maxAmountStETH, stakeLimitInfo } = networkData;

  const validationContextAwaited: WrapFormValidationContext | undefined =
    useMemo(() => {
      if ((active && !(maxAmountETH && maxAmountStETH)) || !stakeLimitInfo) {
        return undefined;
      }
      return {
        active,
        maxAmountETH,
        maxAmountStETH,
        stakeLimitLevel: stakeLimitInfo.stakeLimitLevel,
      };
    }, [active, maxAmountETH, maxAmountStETH, stakeLimitInfo]);

  return useAwaiter(validationContextAwaited).awaiter;
};
