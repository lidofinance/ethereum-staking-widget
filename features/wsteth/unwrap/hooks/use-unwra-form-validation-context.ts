import { useMemo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useAwaiter } from 'shared/hooks/use-awaiter';

import type { UnwrapFormNetworkData } from '../unwrap-form-context';

type UseUnwrapFormValidationContextArgs = {
  networkData: UnwrapFormNetworkData;
};

export const useUnwrapFormValidationContext = ({
  networkData,
}: UseUnwrapFormValidationContextArgs) => {
  const { active } = useWeb3();
  const { maxAmount } = networkData;

  const validationContextAwaited = useMemo(() => {
    if (active && !maxAmount) {
      return undefined;
    }
    return {
      isWalletActive: active,
      maxAmount,
    };
  }, [active, maxAmount]);

  return useAwaiter(validationContextAwaited).awaiter;
};
