import { useCallback, useMemo } from 'react';
import invariant from 'tiny-invariant';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useDappStatus, useLidoSDK } from 'modules/web3';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import {
  RequestStatus,
  RequestStatusClaimable,
  RequestStatusPending,
} from 'features/withdrawals/types/request-status';
import { getWQApiUrlByChain } from 'features/withdrawals/utils/get-custom-api-url';
import { MAX_SHOWN_REQUEST_PER_TYPE } from 'features/withdrawals/withdrawals-constants';

export type WithdrawalRequests = NonNullable<
  ReturnType<typeof useWithdrawalRequests>['data']
>;

export type RequestInfoDto = {
  finalizationIn: number;
  finalizationAt: string;
  requestId: string;
  requestedAt: string;
};

export type RequestTimeByRequestIds = {
  requestInfo: RequestInfoDto;
  nextCalculationAt: string;
};

export const useWithdrawalRequests = () => {
  const { withdraw } = useLidoSDK();
  const { chainId, address, isSupportedChain } = useDappStatus();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => ['withdrawals-requests', address, chainId, isSupportedChain],
    [address, chainId, isSupportedChain],
  );

  const queryResult = useQuery({
    queryKey,
    enabled: !!address,
    ...STRATEGY_LAZY,
    queryFn: async () => {
      invariant(address, '[useWithdrawalData] The "address" must be defined');

      const [requestIds, lastCheckpointIndex] = await Promise.all([
        withdraw.views
          .getWithdrawalRequestsIds({ account: address })
          .then((ids) => [...ids].sort((aId, bId) => (aId > bId ? 1 : -1))),
        withdraw.views.getLastCheckpointIndex(),
      ]);

      const STATUS_BATCH_SIZE = 500;
      const requestStatuses = [];

      for (let i = 0; i < requestIds.length; i += STATUS_BATCH_SIZE) {
        const batch = requestIds.slice(i, i + STATUS_BATCH_SIZE);
        const batchStatuses = await withdraw.views.getWithdrawalStatus({
          requestsIds: batch,
        });
        requestStatuses.push(...batchStatuses);
      }

      const claimableRequests: RequestStatus[] = [];
      const pendingRequests: RequestStatusPending[] = [];
      const pendingRequestsIds: bigint[] = [];

      requestStatuses.forEach((request, index) => {
        if (!request.isFinalized) {
          pendingRequestsIds.push(requestIds[index]);
        }
      });

      let wqRequests: { finalizationAt: string; id: string | undefined }[] = [];

      try {
        const requests =
          await withdraw.waitingTime.getWithdrawalWaitingTimeByRequestIds({
            ids: pendingRequestsIds,
            getCustomApiUrl: getWQApiUrlByChain,
          });

        wqRequests = requests
          .filter((request) => request?.requestInfo)
          .map((request) => ({
            id: request.requestInfo.requestId,
            finalizationAt: request.requestInfo.finalizationAt,
          }));
      } catch (e) {
        console.warn(
          `[useWithdrawalData] Failed to fetch request time for requests ids: ${pendingRequestsIds}. Details:`,
          e,
        );
      }

      let pendingAmountOfStETH = 0n;
      let claimableAmountOfStETH = 0n;

      requestStatuses.forEach((request, index) => {
        const id = requestIds[index];
        const req: RequestStatus = {
          ...request,
          finalizationAt: null,
        };

        if (request.isFinalized && !request.isClaimed) {
          claimableRequests.push(req);
          claimableAmountOfStETH += request.amountOfStETH;
        } else if (!request.isFinalized) {
          const r = wqRequests.find((r) => r.id === id.toString());
          pendingRequests.push({
            ...req,
            finalizationAt: r?.finalizationAt ?? null,
            expectedEth: req.amountOfStETH, // TODO: replace with calcExpectedRequestEth(req, currentShareRate),
          });
          pendingAmountOfStETH += request.amountOfStETH;
        }
      });

      let isClamped =
        claimableRequests.splice(MAX_SHOWN_REQUEST_PER_TYPE).length > 0;
      isClamped ||=
        pendingRequests.splice(MAX_SHOWN_REQUEST_PER_TYPE).length > 0;

      const hints = await withdraw.views.findCheckpointHints({
        sortedIds: claimableRequests.map(({ id }) => id),
        firstIndex: 1n,
        lastIndex: lastCheckpointIndex,
      });

      const claimableEth = await withdraw.views.getClaimableEther({
        sortedIds: claimableRequests.map(({ id }) => id),
        hints,
      });

      let claimableAmountOfETH = 0n;

      const sortedClaimableRequests: RequestStatusClaimable[] =
        claimableRequests.map((request, index) => {
          claimableAmountOfETH += claimableEth[index];
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
  });

  const oldData = queryResult.data;
  const refetch = queryResult.refetch;

  const optimisticClaimRequests = useCallback(
    async (requests: RequestStatusClaimable[]) => {
      if (!oldData) return;

      const { steth, eth } = requests.reduce(
        (acc, request) => ({
          steth: acc.steth + request.amountOfStETH,
          eth: acc.eth + request.claimableEth,
        }),
        { steth: 0n, eth: 0n },
      );

      const optimisticData = {
        ...oldData,
        sortedClaimableRequests: oldData.sortedClaimableRequests.filter(
          (r) => requests.includes(r), // this works because they are same object refs
        ),
        readyCount: oldData.readyCount - requests.length,
        claimedCount: oldData.claimedCount + requests.length,
        claimableAmountOfStETH: oldData.claimableAmountOfStETH - steth,
        claimableAmountOfETH: oldData.claimableAmountOfETH - eth,
      };

      queryClient.setQueryData(queryKey, optimisticData);
      await refetch();
    },
    [oldData, queryClient, refetch, queryKey],
  );

  return { ...queryResult, optimisticClaimRequests, revalidate: refetch };
};
