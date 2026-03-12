import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useDepositRequests } from 'modules/mellow-meta-vaults';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getCollectorContract, getVaultContract } from '../../contracts';
import { ETH_VAULT_DEPOSIT_TOKENS } from '../../consts';

export const useEthVaultDepositRequests = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');
  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );

  const vault = useMemo(
    () => getVaultContract(publicClientMainnet),
    [publicClientMainnet],
  );

  return useDepositRequests({
    collector,
    vault,
    depositTokens: [...ETH_VAULT_DEPOSIT_TOKENS],
  });
};
