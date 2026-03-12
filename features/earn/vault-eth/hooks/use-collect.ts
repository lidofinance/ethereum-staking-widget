import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useCollect } from 'modules/mellow-meta-vaults/hooks/use-collect';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getCollectorContract, getVaultContract } from '../contracts';

export const useEthVaultCollect = () => {
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

  return useCollect({
    collector,
    vault,
  });
};
