import { PublicClient } from 'viem';
import { COLLECTOR_CONFIG } from 'modules/mellow-meta-vaults/consts';
import type { WithdrawRequestData } from 'modules/mellow-meta-vaults/types/withdraw-request-data';
import { TOKENS } from 'consts/tokens';
import { formatBalance } from 'utils/formatBalance';
import { getTokenDecimals } from 'utils/token-decimals';
import { getCollectorContract, getRedeemQueueContract } from '../contracts';
import type { UsdWithdrawToken } from '../types';
import type { UsdVaultWithdrawRequest } from './types';

export const getUsdWithdrawalParams = async ({
  shares,
  publicClient,
}: {
  shares: bigint;
  publicClient: PublicClient;
}) => {
  const collector = getCollectorContract(publicClient);
  // Deliberately pinned to the USDC queue: this powers the USD-denominated
  // position valuation, which stays USDC-based regardless of the payout token.
  const redeemQueueContract = getRedeemQueueContract({
    publicClient,
    token: TOKENS.usdc,
  });

  return collector.read.getWithdrawalParams([
    shares,
    redeemQueueContract.address,
    COLLECTOR_CONFIG,
  ]);
};

// Merges the requests of every payout queue into a single, deterministically
// ordered list, tagging each request with the queue it came from.
export const mergeUsdWithdrawRequests = (
  groups: {
    token: UsdWithdrawToken;
    requests?: readonly WithdrawRequestData[];
  }[],
) => {
  const requests: UsdVaultWithdrawRequest[] = groups
    .flatMap(({ token, requests = [] }) =>
      requests.map((request) => ({ ...request, token })),
    )
    // Oldest first — the order a USDC-only user already sees today.
    // A timestamp is unique only within one queue, so two requests made in the
    // same block can share it. Compare the token too, so the order does not
    // depend on which queue was passed in first.
    .sort((a, b) =>
      a.timestamp === b.timestamp
        ? a.token.localeCompare(b.token)
        : Number(a.timestamp - b.timestamp),
    );

  return {
    requests,
    claimableRequests: requests.filter((request) => request.isClaimable),
    pendingRequests: requests.filter((request) => !request.isClaimable),
  };
};

export const groupUsdWithdrawRequestsByToken = (
  requests: UsdVaultWithdrawRequest[],
) => ({
  [TOKENS.usdc]: requests.filter(({ token }) => token === TOKENS.usdc),
  [TOKENS.usdt]: requests.filter(({ token }) => token === TOKENS.usdt),
});

export const getWillReceiveOptionLabel = ({
  assets,
  symbol,
}: {
  assets?: bigint | null;
  symbol: string;
}) => {
  if (assets == null) return symbol;

  const { trimmed } = formatBalance(assets, {
    decimals: getTokenDecimals(symbol),
    maxDecimalDigits: 4,
  });

  return `${trimmed} ${symbol}`;
};
