import { useMemo } from 'react';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { useAwaiter } from 'shared/hooks/use-awaiter';

import type { UnwrapFormNetworkData } from '../unwrap-form-context';

type UseUnwrapFormValidationContextArgs = {
  networkData: UnwrapFormNetworkData;
};

export const useUnwrapFormValidationContext = ({
  networkData,
}: UseUnwrapFormValidationContextArgs) => {
  const { isDappActive } = useDappStatus();
  const { maxAmount } = networkData;

  const validationContextAwaited = useMemo(() => {
    if (isDappActive && !maxAmount) {
      return undefined;
    }
    return {
      isWalletActive: isDappActive,
      maxAmount,
    };
  }, [isDappActive, maxAmount]);

  return useAwaiter(validationContextAwaited).awaiter;
};
