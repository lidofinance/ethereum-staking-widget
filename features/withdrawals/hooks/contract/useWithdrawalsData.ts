import { useCallback } from 'react';
import { Zero } from '@ethersproject/constants';
import { BigNumber } from 'ethers';
import { useLidoSWR } from '@lido-sdk/react';
// import { useLidoShareRate } from 'features/withdrawals/hooks/contract/useLidoShareRate';

import { useWithdrawalsContract } from './useWithdrawalsContract';

import {
  RequestStatus,
  RequestStatusClaimable,
  RequestStatusPending,
} from 'features/withdrawals/types/request-status';
import { MAX_SHOWN_REQUEST_PER_TYPE } from 'features/withdrawals/withdrawals-constants';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

// import { calcExpectedRequestEth } from 'features/withdrawals/utils/calc-expected-request-eth';

export type WithdrawalRequests = NonNullable<
  ReturnType<typeof useWithdrawalRequests>['data']
>;

export const useWithdrawalRequests = () => {
  const { contractRpc, account, chainId } = useWithdrawalsContract();
  // const { data: currentShareRate } = useLidoShareRate();

  const swr = useLidoSWR(
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
    STRATEGY_LAZY,
  );
  const oldData = swr.data;
  const mutate = swr.mutate;
  const optimisticClaimRequests = useCallback(
    async (requests: RequestStatusClaimable[]) => {
      if (!oldData) return undefined;
      const { steth, eth } = requests.reduce(
        (acc, request) => {
          return {
            steth: acc.steth.add(request.amountOfStETH),
            eth: acc.eth.add(request.claimableEth),
          };
        },
        { steth: Zero, eth: Zero },
      );
      const optimisticData = {
        ...oldData,
        sortedClaimableRequests: oldData.sortedClaimableRequests.filter(
          (r) => requests.includes(r), // this works because they are same object refs
        ),
        readyCount: oldData.readyCount - requests.length,
        claimedCount: oldData.claimedCount + requests.length,
        claimableAmountOfStETH: oldData.claimableAmountOfStETH.sub(steth),
        claimableAmountOfETH: oldData.claimableAmountOfETH.sub(eth),
      };
      return mutate(optimisticData, true);
    },
    [oldData, mutate],
  );

  const revalidate = useCallback(
    () => mutate(oldData, true),
    [oldData, mutate],
  );

  return { ...swr, optimisticClaimRequests, revalidate };
};
