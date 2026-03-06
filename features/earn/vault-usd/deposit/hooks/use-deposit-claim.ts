import invariant from 'tiny-invariant';
import { WalletClient } from 'viem';
import { usePublicClient } from 'wagmi';
import { useMemo } from 'react';
import { useTxModalStagesDepositClaim } from 'modules/mellow-meta-vaults/hooks/use-deposit-claim-tx-modal';
import { useDepositClaim } from 'modules/mellow-meta-vaults/hooks/use-deposit-claim';
import { useLidoSDK } from 'modules/web3/web3-provider';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { getVaultWritableContract } from '../../contracts';
import { USD_VAULT_TOKEN_SYMBOL, USD_VAULT_QUERY_SCOPE } from '../../consts';

export const useUsdVaultDepositClaim = (onRetry?: () => void) => {
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
      willReceiveToken: USD_VAULT_TOKEN_SYMBOL,
      operationText: 'claiming',
    },
  });

  return useDepositClaim({
    vault,
    txModalStages,
    onRetry,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositClaim,
    additionalQueryScopes: [USD_VAULT_QUERY_SCOPE],
  });
};
