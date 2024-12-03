import { useCapabilities, useSendCalls } from 'wagmi/experimental';
import { useDappStatus } from './use-dapp-status';
import { useCallback } from 'react';
import {
  eip5792Actions,
  type GetCallsStatusReturnType,
} from 'viem/experimental';
import invariant from 'tiny-invariant';
import { useLidoSDK, useLidoSDKL2 } from '../web3-provider';
import { config } from 'config';
import { NOOP } from '@lidofinance/lido-ethereum-sdk';

const retry = (retryCount: number, error: object) => {
  if (
    'code' in error &&
    typeof error.code === 'number' &&
    error.code === -32601
  )
    return false;
  return retryCount <= 3;
};

export const useAA = () => {
  const { chainId } = useDappStatus();
  const capabilitiesQuery = useCapabilities({
    query: {
      retry,
    },
  });

  const capabilities =
    capabilitiesQuery.data && capabilitiesQuery.data[chainId];

  const isAA = !!capabilities;

  const areAuxiliaryFundsSupported =
    capabilities?.auxiliaryFunds &&
    capabilities.auxiliaryFunds.supported === true;

  return {
    ...capabilitiesQuery,
    isAA,
    capabilities,
    areAuxiliaryFundsSupported,
  };
};

type SendCallsStages =
  | {
      stage: 'sent';
      callId: string;
    }
  | {
      stage: 'confirmed';
      callStatus: GetCallsStatusReturnType;
    };

export class SendCallsError extends Error {}

export const useSendAACalls = () => {
  const { sendCallsAsync } = useSendCalls();
  const { core: l1core } = useLidoSDK();
  const { core: l2core, isL2 } = useLidoSDKL2();
  const core = isL2 ? l2core : l1core;

  return useCallback(
    async (
      calls: unknown[],
      callback: (props: SendCallsStages) => void = NOOP,
    ) => {
      invariant(core.web3Provider);
      const extendedWalletClient = core.web3Provider.extend(eip5792Actions());

      const callId = await sendCallsAsync({
        calls,
      });

      callback({ stage: 'sent', callId });

      const poll = async () => {
        const timeoutAt = Date.now() + config.AA_TX_POLLING_TIMEOUT;
        while (Date.now() < timeoutAt) {
          const callStatus = await extendedWalletClient
            .getCallsStatus({
              id: callId,
            })
            .catch(() => {
              // workaround for gnosis safe bug
              return { status: 'PENDING' } as const;
            });
          if (callStatus.status === 'CONFIRMED') {
            return callStatus;
          }
          await new Promise((resolve) =>
            setTimeout(resolve, config.PROVIDER_POLLING_INTERVAL),
          );
        }
        throw new SendCallsError(
          'Timeout for transaction confirmation exceeded.',
        );
      };

      const callStatus = await poll();

      callback({ stage: 'confirmed', callStatus });

      if (
        callStatus.receipts?.find((receipt) => receipt.status === 'reverted')
      ) {
        throw new SendCallsError(
          'Some operation were reverted. Check your wallet for details.',
        );
      }

      // extract last receipt if there was no atomic batch
      const txHash = callStatus.receipts
        ? callStatus.receipts[callStatus.receipts.length - 1].transactionHash
        : undefined;

      return { callStatus, txHash };
    },
    [core.web3Provider, sendCallsAsync],
  );
};
