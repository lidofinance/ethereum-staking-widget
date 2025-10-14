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

export const useDepositRequests = () => {
  const { chainId } = useDappStatus();

  // Fetch deposit request data from the Collector contract
  const { data: collectedData } = useSTGCollect();
  const collectedRequests = collectedData?.deposits;

  const requests = useMemo(() => {
    if (!collectedRequests || collectedRequests.length === 0) return [];

    return STG_DEPOSABLE_TOKENS.map((token) => {
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
  }, [chainId, collectedRequests]);

  const claimableRequests = useMemo(
    () => requests.filter((request) => request.isClaimable),
    [requests],
  );

  const pendingRequests = useMemo(
    () => requests.filter((request) => !request.isClaimable),
    [requests],
  );

  return { requests, claimableRequests, pendingRequests };
};
