import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useCapabilities, useSendCalls } from 'wagmi/experimental';
import {
  eip5792Actions,
  type GetCallsStatusReturnType,
} from 'viem/experimental';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk';

import { useDappStatus } from './use-dapp-status';
import { useLidoSDK, useLidoSDKL2 } from '../web3-provider';
import { config, useConfig } from 'config';

import type { Address, Hash } from 'viem';

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
  const { featureFlags } = useConfig().externalConfig;

  // merge capabilities per https://eips.ethereum.org/EIPS/eip-5792
  const capabilities = capabilitiesQuery.data
    ? {
        ...(capabilitiesQuery.data[0] ?? {}),
        ...(capabilitiesQuery.data[chainId] ?? {}),
      }
    : undefined;

  // use new AA flow only for atomic batch supported accounts
  // per EIP-5792 ANY successful call to getCapabilities is a sign of EIP support
  // but due to limited and variable support of this EIP we have to be narrow this down
  // known issues - batched action support for EOAs in many wallets
  // Also, there is an option to disable batch txs via EIP-5792 sendCalls in IPFS.json config file
  const isAA =
    !!capabilities?.atomicBatch?.supported && !featureFlags.disableSendCalls;

  const areAuxiliaryFundsSupported = !!capabilities?.auxiliaryFunds?.supported;

  return {
    ...capabilitiesQuery,
    isAA,
    capabilities,
    areAuxiliaryFundsSupported,
  };
};

type SendCallsStages =
  | {
      stage: TransactionCallbackStage.SIGN;
    }
  | {
      stage: TransactionCallbackStage.RECEIPT;
      callId: string;
    }
  | {
      stage: TransactionCallbackStage.CONFIRMATION;
      callStatus: GetCallsStatusReturnType;
    }
  | {
      stage: TransactionCallbackStage.DONE;
      txHash: Hash;
    }
  | {
      stage: TransactionCallbackStage.ERROR;
      error: unknown;
    };

export class SendCallsError extends Error {}

export type AACall = { to: Address; data?: Hash; value?: bigint };

export const useSendAACalls = () => {
  const { sendCallsAsync } = useSendCalls();
  const { core: l1core } = useLidoSDK();
  const { core: l2core, isL2 } = useLidoSDKL2();
  const core = isL2 ? l2core : l1core;

  return useCallback(
    async (
      // falsish calls will be filtered out
      calls: (AACall | null | undefined | false)[],
      callback: (props: SendCallsStages) => Promise<void> = async () => {},
    ) => {
      try {
        invariant(core.web3Provider);
        const extendedWalletClient = core.web3Provider.extend(eip5792Actions());

        await callback({
          stage: TransactionCallbackStage.SIGN,
        });

        const callData = await sendCallsAsync({
          calls: (calls.filter((call) => !!call) as AACall[]).map((call) => ({
            to: call.to,
            data: call.data,
            value: call.value,
          })),
        });

        await callback({
          stage: TransactionCallbackStage.RECEIPT,
          callId: callData.id,
        });

        const poll = async () => {
          const timeoutAt = Date.now() + config.AA_TX_POLLING_TIMEOUT;
          while (Date.now() < timeoutAt) {
            const callStatus = await extendedWalletClient.getCallsStatus({
              id: callData.id,
            });

            if (String(callStatus.status).toLowerCase() !== 'pending') {
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

        await callback({
          stage: TransactionCallbackStage.CONFIRMATION,
          callStatus,
        });

        if (String(callStatus.status).toLowerCase() === 'failure') {
          throw new SendCallsError(
            'Transaction failed. Check your wallet for details.',
          );
        }

        if (
          callStatus.receipts?.find((receipt) => receipt.status === 'reverted')
        ) {
          throw new SendCallsError(
            'Some operation were reverted. Check your wallet for details.',
          );
        }

        // extract last receipt if there was no atomic batch
        const txHash = callStatus.receipts
          ? callStatus?.receipts[callStatus.receipts.length - 1]
              ?.transactionHash
          : undefined;

        if (!txHash) {
          throw new SendCallsError(
            'Could not locate TX hash.Check your wallet for details.',
          );
        }

        await callback({
          stage: TransactionCallbackStage.DONE,
          txHash,
        });

        return { callStatus, txHash };
      } catch (error) {
        await callback({ stage: TransactionCallbackStage.ERROR, error });
        throw error;
      }
    },
    [core.web3Provider, sendCallsAsync],
  );
};
