import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useActiveFees } from 'modules/mellow-meta-vaults/hooks/use-active-fees';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getVaultContract } from '../contracts';

export const useUsdVaultActiveFees = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');
  const vault = useMemo(
    () => getVaultContract(publicClientMainnet),
    [publicClientMainnet],
  );

  return useActiveFees({ vault });
};
