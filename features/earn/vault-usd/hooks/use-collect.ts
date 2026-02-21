import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { useMemo } from 'react';
import { useCollect } from 'modules/mellow-meta-vaults/hooks/use-collect';
import { getCollectorContract, getVaultContract } from '../contracts';

export const useUsdVaultCollect = () => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');
  const collector = useMemo(
    () => getCollectorContract(publicClient),
    [publicClient],
  );
  const vault = useMemo(() => getVaultContract(publicClient), [publicClient]);

  return useCollect({
    collector,
    vault,
  });
};
