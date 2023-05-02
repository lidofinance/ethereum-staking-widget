import { BigNumber } from 'ethers';
import { useLidoSWR } from '@lido-sdk/react';
// import { useLidoShareRate } from 'features/withdrawals/hooks/contract/useLidoShareRate';

import { useWithdrawalsContract } from './useWithdrawalsContract';
import {
  useIsBunkerMode,
  useIsPaused,
  useMaxAmount,
  useMinAmount,
} from './withdrawalsCalls';
import {
  RequestStatus,
  RequestStatusClaimable,
  RequestStatusPending,
} from 'features/withdrawals/types/request-status';
import { MAX_SHOWN_REQUEST_PER_TYPE } from 'features/withdrawals/withdrawals-constants';
// import { calcExpectedRequestEth } from 'features/withdrawals/utils/calc-expected-request-eth';

export const useWithdrawalRequests = () => {
  const { contractRpc, account, chainId } = useWithdrawalsContract();
  // const { data: currentShareRate } = useLidoShareRate();

  return useLidoSWR(
    // TODO: use this fragment for expected eth calculation
    // currentShareRate
    //   ? ['swr:withdrawals-requests', account, chainId, currentShareRate]
    //   : false,
    ['swr:withdrawals-requests', account, chainId],
    async (...args: unknown[]) => {
      const account = args[1] as string;
      // const currentShareRate = args[3] as BigNumber;

      const [requestIds, lastCheckpointIndex] = await Promise.all([
        contractRpc.getWithdrawalRequests(account),
        contractRpc.getLastCheckpointIndex(),
      ]);
      const requestStatuses = await contractRpc.getWithdrawalStatus(requestIds);

      const claimableRequests: RequestStatus[] = [];
      const pendingRequests: RequestStatusPending[] = [];

      let pendingAmountOfStETH = BigNumber.from(0);
      let claimableAmountOfStETH = BigNumber.from(0);

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
          pendingRequests.push({
            ...req,
            expectedEth: req.amountOfStETH, // TODO: replace with calcExpectedRequestEth(req, currentShareRate),
          });
          pendingAmountOfStETH = pendingAmountOfStETH.add(
            request.amountOfStETH,
          );
        }

        return req;
      });

      let isClamped =
        claimableRequests.splice(MAX_SHOWN_REQUEST_PER_TYPE).length > 0;
      isClamped ||=
        pendingRequests.splice(MAX_SHOWN_REQUEST_PER_TYPE).length > 0;

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
      const sortedClaimableRequests: RequestStatusClaimable[] =
        _sortedClaimableRequests.map((request, index) => {
          claimableAmountOfETH = claimableAmountOfETH.add(claimableEth[index]);
          return {
            ...request,
            hint: hints[index],
            claimableEth: claimableEth[index],
          };
        });

      return {
        pendingRequests,
        sortedClaimableRequests,
        pendingCount: pendingRequests.length,
        readyCount: sortedClaimableRequests.length,
        claimedCount: claimableRequests.length,
        pendingAmountOfStETH,
        claimableAmountOfStETH,
        claimableAmountOfETH,
        isClamped,
      };
    },
    {},
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
