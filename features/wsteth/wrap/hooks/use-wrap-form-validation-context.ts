import { useMemo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useAwaiter } from 'shared/hooks/use-awaiter';

import type { WrapFormNetworkData } from '../wrap-form-context';

type UseWrapFormValidationContextArgs = {
  networkData: WrapFormNetworkData;
};

export const useWrapFormValidationContext = ({
  networkData,
}: UseWrapFormValidationContextArgs) => {
  const { active } = useWeb3();
  const { maxAmountETH, maxAmountStETH } = networkData;

  const validationContextAwaited = useMemo(() => {
    if (active && (!maxAmountETH || !maxAmountStETH)) {
      return undefined;
    }
    return {
      active,
      maxAmountETH,
      maxAmountStETH,
    };
  }, [active, maxAmountETH, maxAmountStETH]);

  return useAwaiter(validationContextAwaited).awaiter;
};
