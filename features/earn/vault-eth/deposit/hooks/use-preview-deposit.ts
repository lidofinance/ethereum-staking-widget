import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { usePreviewDeposit } from 'modules/mellow-meta-vaults';
import { getCollectorContract, getDepositQueueContract } from '../../contracts';

export const useEthVaultPreviewDeposit = ({ amount, token }: any) => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');
  const collector = getCollectorContract(publicClient);
  const depositQueue = getDepositQueueContract({ publicClient, token });

  return usePreviewDeposit({
    collector,
    depositQueue,
    amount,
    token,
  });
};
