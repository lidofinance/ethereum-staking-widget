import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { useDepositRequest } from 'modules/mellow-meta-vaults';
import { getCollectorContract, getVaultContract } from '../../contracts';
import type { UsdDepositToken } from '../../types';

export const useUsdVaultDepositRequest = ({
  token,
}: {
  token: UsdDepositToken;
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
