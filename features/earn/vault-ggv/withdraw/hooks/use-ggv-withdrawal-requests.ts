/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Address,
  encodeAbiParameters,
  Hash,
  isAddressEqual,
  keccak256,
} from 'viem';
import { useQuery } from '@tanstack/react-query';
import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';

import { getGGVQueueContract, getGGVVaultContract } from '../../contracts';
import { getTokenAddress } from 'config/networks/token-address';

import type { WQApiResponse } from '../types';
import { GGV_STATS_ORIGIN } from '../../consts';

export type GGVWithdrawalRequestsResponse = ReturnType<
  typeof transformAPIResponse
>;

const REQUEST_STRUCT_ABI = [
  { internalType: 'uint96', name: 'nonce', type: 'uint96' },
  { internalType: 'address', name: 'user', type: 'address' },
  { internalType: 'address', name: 'assetOut', type: 'address' },
  { internalType: 'uint128', name: 'amountOfShares', type: 'uint128' },
  { internalType: 'uint128', name: 'amountOfAssets', type: 'uint128' },
  { internalType: 'uint40', name: 'creationTime', type: 'uint40' },
  { internalType: 'uint24', name: 'secondsToMaturity', type: 'uint24' },
  { internalType: 'uint24', name: 'secondsToDeadline', type: 'uint24' },
] as const;

// double checked against onchain method
const getRequestId = ({
  metadata,
}: GGVWithdrawalRequestsResponse['openRequests'][number]) =>
  keccak256(
    encodeAbiParameters(REQUEST_STRUCT_ABI, [
      metadata.nonce,
      metadata.user,
      metadata.assetOut,
      metadata.amountOfShares,
      metadata.amountOfAssets,
      metadata.creationTime,
      metadata.secondsToMaturity,
      metadata.secondsToDeadline,
    ]),
  );

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
      nonce: BigInt(request.metadata.nonce),
      user: request.metadata.user as Address,
      assetOut: request.metadata.assetOut as Address,
      amountOfAssets: BigInt(request.metadata.amountOfAssets),
      amountOfShares: BigInt(request.metadata.amountOfShares),
      creationTime: Number(request.metadata.creationTime),
      secondsToDeadline: Number(request.metadata.secondsToDeadline),
      secondsToMaturity: Number(request.metadata.secondsToMaturity),
    },
  });

  return {
    openRequests: response.Response.open_requests.map(transformRequest),
    fulfilledRequests: response.Response.fulfilled_requests
      .map(({ Fulfillment, Request }) => ({
        request: transformRequest(Request),
        fulfillment: {
          block_number: BigInt(Fulfillment.block_number),
          timestamp: BigInt(Fulfillment.timestamp),
          transaction_hash: Fulfillment.transaction_hash as Hash,
        },
      }))
      .sort(
        (a, b) => Number(b.request.timestamp) - Number(a.request.timestamp),
      ),
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
    queryKey: [
      'ggv',
      'withdrawal-requests',
      { address: address as Address },
    ] as const,
    enabled: !!address,
    queryFn: async ({ queryKey }) => {
      const address = queryKey[2].address;

      //TODO: add event based fallback
      const vault = getGGVVaultContract(publicClientMainnet);
      const wstethAddress = getTokenAddress(
        publicClientMainnet.chain!.id,
        'wstETH',
      );
      const queue = getGGVQueueContract(publicClientMainnet);

      const url = `${GGV_STATS_ORIGIN}/boringQueue/ethereum/${vault.address}/${address}?string_values=true`;

      const response: WQApiResponse = await fetch(url).then((res) =>
        res.json(),
      );

      const requests = transformAPIResponse(response);

      // filter out non-wsteth requests
      requests.openRequests = requests.openRequests.filter((request) =>
        isAddressEqual(request.wantToken, wstethAddress!),
      );
      requests.fulfilledRequests = requests.fulfilledRequests.filter(
        ({ request }) => isAddressEqual(request.wantToken, wstethAddress!),
      );

      // filter out requests that don't exist on chain
      const existingRequestIds = await queue.read.getRequestIds();
      const existingRequestIdsSet = new Set(existingRequestIds);
      requests.openRequests = requests.openRequests.filter((request) =>
        existingRequestIdsSet.has(getRequestId(request)),
      );

      // TODO: filter openRequests against contract to prevent stale data
      // filter out non wsteth
      return { requests, hasActiveRequests: requests.openRequests.length > 0 };
    },
  });
};
