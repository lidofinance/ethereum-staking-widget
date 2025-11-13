import { useMemo } from 'react';
import { getTokenAddress } from 'config/networks/token-address';
import { useDappStatus } from 'modules/web3/hooks';
import { STG_DEPOSIT_TOKENS } from '../form-context/types';
import { useSTGCollect } from '../../hooks/use-stg-collect';
import { STG_DEPOSABLE_TOKENS } from '../../consts';

export type DepositRequest = {
  createdTimestamp: bigint;
  claimableShares: bigint;
  assets: bigint;
  isClaimable: boolean;
  token: STG_DEPOSIT_TOKENS;
};

export type DepositRequests = Array<DepositRequest>;

export const useDepositRequests = (): {
  requests: DepositRequest[];
  claimableRequests: DepositRequest[];
  pendingRequests: DepositRequest[];
  totalClaimableStrethShares: bigint;
  isLoading: boolean;
} => {
  const { chainId } = useDappStatus();

  // Fetch deposit request data from the Collector contract
  const { data: collectedData, isLoading: isLoadingCollectedData } =
    useSTGCollect();
  const collectedRequests = collectedData?.deposits;

  return useMemo(() => {
    if (!collectedRequests || collectedRequests.length === 0) {
      return {
        requests: [],
        claimableRequests: [],
        pendingRequests: [],
        totalClaimableStrethShares: 0n,
        isLoading: false,
      };
    }

    const requests = STG_DEPOSABLE_TOKENS.map((token) => {
      const collectedRequest = collectedRequests.find(
        (request) =>
          request.asset.toLowerCase() ===
          getTokenAddress(chainId, token)?.toLowerCase(),
      );

      if (!collectedRequest) return null;

      // Shares for the deposit request become claimable when the request is pushed to the vault.
      // The claimable/pushed deposit request stays in the Deposit Queue until it is claimed.
      // The pushed deposit request has eta == 0n from the Collector contract.
      // Otherwise, the deposit request is considered pending.
      const eta = collectedRequest.eta;
      const isClaimable = eta === 0n;

      return {
        createdTimestamp: collectedRequest.timestamp,
        claimableShares: collectedRequest.shares,
        assets: collectedRequest.assets,
        isClaimable,
        token,
      };
    }).filter((request): request is DepositRequest => !!request);

    const claimableRequests = requests.filter((request) => request.isClaimable);
    const pendingRequests = requests.filter((request) => !request.isClaimable);
    const totalClaimableStrethShares = claimableRequests.reduce(
      (sum, requestData) => sum + (requestData.claimableShares ?? 0n),
      0n,
    );

    return {
      requests,
      claimableRequests,
      pendingRequests,
      totalClaimableStrethShares,
      isLoading: isLoadingCollectedData,
    };
  }, [chainId, collectedRequests, isLoadingCollectedData]);
};
