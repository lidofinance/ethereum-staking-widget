import invariant from 'tiny-invariant';
import { WalletClient } from 'viem';
import { usePublicClient } from 'wagmi';
import { useMemo } from 'react';
import { useTxModalStagesDepositClaim } from 'modules/mellow-meta-vaults/hooks/use-deposit-claim-tx-modal';
import { useDepositClaim } from 'modules/mellow-meta-vaults/hooks/use-deposit-claim';
import { useLidoSDK } from 'modules/web3/web3-provider';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { getVaultWritableContract } from '../../contracts';
import { ETH_VAULT_TOKEN_SYMBOL, ETH_VAULT_QUERY_SCOPE } from '../../consts';

export const useEthVaultDepositClaim = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');
  const vault = useMemo(
    () =>
      getVaultWritableContract(publicClient, core.web3Provider as WalletClient),
    [publicClient, core.web3Provider],
  );

  const { txModalStages } = useTxModalStagesDepositClaim({
    stageOperationArgs: {
      willReceiveToken: ETH_VAULT_TOKEN_SYMBOL,
      operationText: 'claiming',
    },
  });

  return useDepositClaim({
    vault,
    txModalStages,
    onRetry,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthDepositClaim,
    additionalQueryScopes: [ETH_VAULT_QUERY_SCOPE],
  });
};
