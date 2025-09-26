import { useMemo } from 'react';
import { useSTGDepositQueueRequest } from './use-stg-deposit-queue-request';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { getTokenAddress } from 'config/networks/token-address';
import { useDappStatus } from 'modules/web3/hooks';
import { STG_DEPOSIT_TOKENS } from '../form-context/types';
import { useSTGCollect } from '../../hooks/use-stg-collect';

export interface DepositRequestData {
  depositRequest: ReturnType<
    typeof useSTGDepositQueueRequest
  >['depositRequest'];
  claimableShares: bigint;
  assets: bigint;
  usdAmount: number | null;
  collectedRequest: any;
  isPushedToVault: boolean;
  token: STG_DEPOSIT_TOKENS;
}

// Combines data from the Collector contract and the Deposit Queue contract
// to provide a comprehensive view of the user's deposit request for a specific token.
export const useDepositRequestData = (
  token: STG_DEPOSIT_TOKENS,
): DepositRequestData => {
  const { chainId } = useDappStatus();

  // Fetch deposit request data from the Collector contract
  const { data: collectedData } = useSTGCollect();
  const allCollectedRequests = collectedData?.deposits;

  // Fetch deposit request data and claimable shares from the Deposit Queue contract
  const { depositRequest, claimableShares } = useSTGDepositQueueRequest(token);

  const assets = depositRequest?.assets ?? 0n;

  // Use appropriate USD hook based on token type
  const ethUsdQuery = useEthUsd(token === 'wstETH' ? 0n : assets);
  const wstethUsdQuery = useWstethUsd(token === 'wstETH' ? assets : 0n);

  const usdAmount =
    token === 'wstETH' ? wstethUsdQuery.usdAmount : ethUsdQuery.usdAmount;

  const collectedRequest = useMemo(() => {
    if (!allCollectedRequests) return null;

    return allCollectedRequests.find(
      (request) =>
        request.asset.toLowerCase() ===
        getTokenAddress(chainId, token)?.toLowerCase(),
    );
  }, [allCollectedRequests, chainId, token]);

  // Using the request data from the Collector contract
  // to determine if the request is pushed to the vault.
  // The data from the Collector contract contains an 'eta' field,
  // which is not provided by the Deposit Queue contract.
  // If eta is 0, it means the request is pushed,
  // if eta is greater than 0, it means the request is pending.
  const isPushedToVault = Boolean(collectedRequest?.eta === 0n);

  return {
    depositRequest,
    claimableShares,
    assets,
    usdAmount: usdAmount ?? 0,
    collectedRequest,
    isPushedToVault,
    token,
  };
};
