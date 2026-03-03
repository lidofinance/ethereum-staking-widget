import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { useDepositRequest } from 'modules/mellow-meta-vaults';
import { getCollectorContract, getVaultContract } from '../../contracts';
import type { EthDepositToken } from '../../types';

export const useEthVaultDepositRequest = ({
  token,
}: {
  token: EthDepositToken;
}) => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');
  const collector = getCollectorContract(publicClient);

  return useDepositRequest({
    collector,
    vault: getVaultContract(publicClient),
    token,
  });
};
