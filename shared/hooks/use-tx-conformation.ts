import { useCurrentSupportedChain } from 'providers/supported-chain';
import { useCallback } from 'react';
import type { Hash } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useClient } from 'wagmi';

// helper hook until migration to wagmi is complete
// awaits TX trough wagmi transport to allow sync with balance hooks
export const useTxConfirmation = () => {
  const chainId = useCurrentSupportedChain();
  const client = useClient({ chainId });
  return useCallback(
    (hash: string) => {
      return waitForTransactionReceipt(client as any, {
        confirmations: 1,
        hash: hash as Hash,
      });
    },
    [client],
  );
};
