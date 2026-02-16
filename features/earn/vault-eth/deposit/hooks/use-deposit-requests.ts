import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { useMemo } from 'react';
import { useDepositRequests } from 'modules/mellow-meta-vaults';
import { getCollectorContract, getVaultContract } from '../../contracts';
import { ETH_VAULT_DEPOSIT_TOKENS } from '../../consts';

export const useEthVaultDepositRequests = () => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');
  const collector = useMemo(
    () => getCollectorContract(publicClient),
    [publicClient],
  );

  const vault = useMemo(() => getVaultContract(publicClient), [publicClient]);

  return useDepositRequests({
    collector,
    vault,
    depositTokens: [...ETH_VAULT_DEPOSIT_TOKENS],
  });
};
