import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { useDepositRequests } from 'modules/mellow-meta-vaults';
import { getCollectorContract, getVaultContract } from '../../contracts';
import { ETH_VAULT_DEPOSABLE_TOKENS } from '../../consts';

export const useEthVaultDepositRequests = () => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');
  const collector = getCollectorContract(publicClient);

  return useDepositRequests({
    collector,
    vault: getVaultContract(publicClient),
    depositTokens: [...ETH_VAULT_DEPOSABLE_TOKENS],
  });
};
