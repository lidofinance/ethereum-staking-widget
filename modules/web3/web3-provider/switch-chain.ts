import { useCallback } from 'react';

import { useSwitchChain as useWagmiSwitchChain } from 'wagmi';
import { CHAIN_SWITCH_TIMEOUT } from '../consts';
import { UserRejectedRequestError } from 'viem';
import { ToastError } from '@lidofinance/lido-ui';
import { useIsSafeWallet } from '../hooks';

export class SwitchChainTimeoutError extends Error {
  constructor() {
    super('Switch chain timeout');
  }
}

export const useSwitchChain = () => {
  const isSafeWallet = useIsSafeWallet();
  const { mutateAsync, reset, ...rest } = useWagmiSwitchChain({
    mutation: { retry: false },
  });
  const canSwitchChain = !isSafeWallet;

  const trySwitchChain = useCallback(
    async (chainId: number) => {
      try {
        const result = await Promise.race([
          mutateAsync({ chainId }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new SwitchChainTimeoutError()),
              CHAIN_SWITCH_TIMEOUT,
            ),
          ),
        ]);
        return { success: true, chainId: result.id, reason: null, error: null };
      } catch (error) {
        // reset isPending even if mutation is stuck due to user inactivity or wallet not responding.
        // this clears UI state
        reset();
        const isTimeoutError = error instanceof SwitchChainTimeoutError;
        const isUserRejectedError = error instanceof UserRejectedRequestError;

        let reason = 'unknown';
        isTimeoutError && (reason = 'timeout');
        isUserRejectedError && (reason = 'user_rejected');

        // Toast only if error is something unknown
        if (!isTimeoutError && !isUserRejectedError) {
          ToastError('Could not switch chain. Please check your wallet.');
        }

        return {
          success: false,
          reason,
          error,
        };
      }
    },
    [mutateAsync, reset],
  );
  return { ...rest, trySwitchChain, canSwitchChain };
};
