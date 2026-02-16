import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { useCollect } from 'modules/mellow-meta-vaults/hooks/use-collect';
import { getCollectorContract, getVaultWritableContract } from '../contracts';

export const useEthVaultCollect = () => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');
  const collector = getCollectorContract(publicClient);
  const vault = getVaultWritableContract(publicClient);

  return useCollect({
    collector,
    vault,
  });
};
