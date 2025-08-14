import { useQuery } from '@tanstack/react-query';
import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { getGGVVaultContract } from '../../contracts';

import type { WQApiResponse } from '../types';
import { Address, Hash } from 'viem';

export type GGVWithdrawalRequestsResponse = ReturnType<
  typeof transformAPIResponse
>;

const transformAPIResponse = (response: WQApiResponse) => {
  const transformRequest = (
    request: WQApiResponse['Response']['open_requests'][number],
  ) => ({
    ...request,
    amount: BigInt(request.amount),
    blockNumber: BigInt(request.blockNumber),
    offerToken: request.offerToken as Address,
    timestamp: BigInt(request.timestamp),
    transaction_hash: request.transaction_hash as Hash,
    user: request.user as Address,
    wantToken: request.wantToken as Address,
    wantTokenDecimals: BigInt(request.wantTokenDecimals),
    metadata: {
      assetOut: request.metadata.assetOut as Address,
      user: request.metadata.user as Address,
      nonce: BigInt(request.metadata.nonce),
      creationTime: BigInt(request.metadata.creationTime),
      amountOfAssets: BigInt(request.metadata.amountOfAssets),
      amountOfShares: BigInt(request.metadata.amountOfShares),
      secondsToDeadline: BigInt(request.metadata.secondsToDeadline),
      secondsToMaturity: BigInt(request.metadata.secondsToMaturity),
    },
  });

  return {
    openRequests: response.Response.open_requests.map(transformRequest),
    fulfilledRequests: response.Response.fulfilled_requests
      .map(transformRequest)
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp)),
    expiredRequests: response.Response.expired_requests.map(transformRequest),
    canceledRequests: response.Response.cancelled_requests.map(
      ({ Cancellation, Request }) => ({
        cancellation: {
          block_number: BigInt(Cancellation.block_number),
          timestamp: BigInt(Cancellation.timestamp),
          transaction_hash: Cancellation.transaction_hash as Hash,
        },
        request: transformRequest(Request),
      }),
    ),
  };
};

export const useGGVWithdrawalRequests = () => {
  const { address } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  return useQuery({
    queryKey: ['ggv', 'withdrawal-requests', { address }],
    enabled: !!address,
    queryFn: async () => {
      //TODO: add event based fallback
      const vault = getGGVVaultContract(publicClientMainnet);

      const url = `https://api.sevenseas.capital/boringQueue/ethereum/${vault.address}/${address}?string_values=true`;

      const response: WQApiResponse = await fetch(url).then((res) =>
        res.json(),
      );

      const requests = transformAPIResponse(response);

      // TODO: filter openRequests against contract to prevent stale data
      // filter out non wsteth
      return { requests, hasActiveRequests: requests.openRequests.length > 0 };
    },
  });
};
