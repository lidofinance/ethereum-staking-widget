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

export const useDepositRequests = (): DepositRequests => {
  const { chainId } = useDappStatus();

  // Fetch deposit request data from the Collector contract
  const { data: collectedData } = useSTGCollect();
  const collectedRequests = collectedData?.deposits;
  if (!collectedRequests) return [];

  const tokens = STG_DEPOSABLE_TOKENS;

  const requests = tokens
    .map((token) => {
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
    })
    .filter((request): request is DepositRequest => !!request);

  return requests;
};
