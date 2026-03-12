import invariant from 'tiny-invariant';
import { useDepositRequest } from 'modules/mellow-meta-vaults';
import { getCollectorContract, getVaultContract } from '../../contracts';
import type { UsdDepositToken } from '../../types';
import { useMainnetOnlyWagmi } from 'modules/web3';

export const useUsdVaultDepositRequest = ({
  token,
}: {
  token: UsdDepositToken;
}) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');
  const collector = getCollectorContract(publicClientMainnet);

  return useDepositRequest({
    collector,
    vault: getVaultContract(publicClientMainnet),
    token,
  });
};
