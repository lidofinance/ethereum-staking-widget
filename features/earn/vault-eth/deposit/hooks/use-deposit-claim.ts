import invariant from 'tiny-invariant';
import { WalletClient } from 'viem';
import { useMemo } from 'react';
import { useTxModalStagesDepositClaim } from 'modules/mellow-meta-vaults/hooks/use-deposit-claim-tx-modal';
import { useDepositClaim } from 'modules/mellow-meta-vaults/hooks/use-deposit-claim';
import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3/web3-provider';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { getVaultWritableContract } from '../../contracts';
import { ETH_VAULT_TOKEN_SYMBOL, ETH_VAULT_QUERY_SCOPE } from '../../consts';

export const useEthVaultDepositClaim = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');
  const vault = useMemo(
    () =>
      getVaultWritableContract(
        publicClientMainnet,
        core.web3Provider as WalletClient,
      ),
    [publicClientMainnet, core.web3Provider],
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
