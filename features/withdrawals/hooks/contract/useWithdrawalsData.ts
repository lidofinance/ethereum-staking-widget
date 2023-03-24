import { BigNumber } from 'ethers';
import { useLidoSWR } from '@lido-sdk/react';

import { useWithdrawalsContract } from './useWithdrawalsContract';
import {
  useIsBunkerMode,
  useIsPaused,
  useMaxAmount,
  useMinAmount,
} from './withdrawalsCalls';

export type RequestStatus = {
  amountOfStETH: BigNumber;
  amountOfShares: BigNumber;
  owner: string;
  timestamp: BigNumber;
  isFinalized: boolean;
  isClaimed: boolean;
  id: BigNumber;
  stringId: string;
};

export type ClaimableRequestStatus = {
  hint: BigNumber;
  claimableEth: BigNumber;
} & RequestStatus;

export const useWithdrawalRequests = () => {
  const { contractRpc, account, chainId } = useWithdrawalsContract();

  return useLidoSWR(
    ['swr:withdrawals-requests', account, chainId],
    async (...args: string[]) => {
      const account = args[1];
      const [requestIds, lastCheckpointIndex] = await Promise.all([
        contractRpc.getWithdrawalRequests(account),
        contractRpc.getLastCheckpointIndex(),
      ]);
      const requestStatuses = await contractRpc.getWithdrawalStatus(requestIds);

      const claimableRequests: RequestStatus[] = [];
      const pendingRequests: RequestStatus[] = [];
      const claimedRequests: RequestStatus[] = [];

      let pendingAmountOfStETH = BigNumber.from(0);
      let claimableAmountOfStETH = BigNumber.from(0);
      let claimedAmountOfStETH = BigNumber.from(0);

      requestStatuses.forEach((request, index) => {
        const id = requestIds[index];
        const req: RequestStatus = {
          ...request,
          id,
          stringId: id.toString(),
        };

        if (request.isFinalized && !request.isClaimed) {
          claimableRequests.push(req);
          claimableAmountOfStETH = claimableAmountOfStETH.add(
            request.amountOfStETH,
          );
        } else if (!request.isFinalized) {
          pendingRequests.push(req);
          pendingAmountOfStETH = pendingAmountOfStETH.add(
            request.amountOfStETH,
          );
        } else {
          claimedRequests.push(req);
          claimedAmountOfStETH = claimedAmountOfStETH.add(
            request.amountOfStETH,
          );
        }

        return req;
      });

      /* Stress test
      let id = BigNumber.from(pendingRequests[pendingRequests.length - 1].id);
      for (let index = pendingRequests.length; index < 100000; index++) {
        id = id.add(1);
        pendingRequests.push({
          amountOfShares: BigNumber.from(10),
          amountOfStETH: BigNumber.from('10000000000000000'),
          id,
          isClaimed: false,
          isFinalized: false,
          stringId: id.toString(),
          owner: account,
          timestamp: BigNumber.from('10000000000000000'),
        });
      }
      */

      const _sortedClaimableRequests = claimableRequests.sort((aReq, bReq) =>
        aReq.id.gt(bReq.id) ? 1 : -1,
      );

      const hints = await contractRpc.findCheckpointHints(
        _sortedClaimableRequests.map(({ id }) => id),
        1,
        lastCheckpointIndex,
      );

      const claimableEth = await contractRpc.getClaimableEther(
        _sortedClaimableRequests.map(({ id }) => id),
        hints,
      );

      let claimableAmountOfETH = BigNumber.from(0);
      const sortedClaimableRequests: ClaimableRequestStatus[] =
        _sortedClaimableRequests.map((request, index) => {
          claimableAmountOfETH = claimableAmountOfETH.add(claimableEth[index]);
          return {
            ...request,
            hint: hints[index],
            claimableEth: claimableEth[index],
          };
        });

      return {
        claimedRequests,
        pendingRequests,
        sortedClaimableRequests,
        pendingCount: pendingRequests.length,
        readyCount: sortedClaimableRequests.length,
        claimedCount: claimableRequests.length,
        pendingAmountOfStETH,
        claimableAmountOfStETH,
        claimedAmountOfStETH,
        claimableAmountOfETH,
      };
    },
  );
};

export const useWithdrawalsStatus = () => {
  const bunkerMode = useIsBunkerMode();
  const paused = useIsPaused();

  const isPaused = !!paused.data;
  const isBunkerMode = !!bunkerMode.data;

  const isLoading = paused.initialLoading || bunkerMode.initialLoading;

  return { isPaused, isBunkerMode, isLoading };
};

export const useWithdrawalsConstants = () => {
  const maxAmount = useMaxAmount();
  const minAmount = useMinAmount();

  const isLoading = maxAmount.initialLoading || minAmount.initialLoading;

  return { maxAmount: maxAmount.data, minAmount: minAmount.data, isLoading };
};
