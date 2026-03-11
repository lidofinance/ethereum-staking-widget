import invariant from 'tiny-invariant';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { useDepositRequest } from 'modules/mellow-meta-vaults';
import { getCollectorContract, getVaultContract } from '../../contracts';
import type { EthDepositToken } from '../../types';

export const useEthVaultDepositRequest = ({
  token,
}: {
  token: EthDepositToken;
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
