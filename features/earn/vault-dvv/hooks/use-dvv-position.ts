import { type Address } from 'viem';
import { useQuery } from '@tanstack/react-query';

import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';

import { getDVVVaultContract } from '../contracts';

export const useDVVPosition = () => {
  const { address, isDappActive } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const isEnabled = isDappActive && !!address;

  const query = useQuery({
    queryKey: ['dvv', 'position', { address }] as const,
    enabled: isEnabled,
    queryFn: async ({ queryKey }) => {
      const address = queryKey[2].address as Address;
      const vault = getDVVVaultContract(publicClientMainnet);

      const sharesBalance = await vault.read.balanceOf([address]);
      const wstethBalance = await vault.read.convertToAssets([sharesBalance]);

      return {
        sharesBalance,
        wstethBalance,
        dvvTokenAddress: vault.address,
      };
    },
  });

  const data = isEnabled ? query.data : undefined;

  const { usdAmount, ...usdQuery } = useWstethUsd(
    data?.wstethBalance,
    publicClientMainnet.chain?.id,
  );

  return {
    ...query,
    usdQuery,
    dvvTokenAddress: data?.dvvTokenAddress,
    sharesBalance: data?.sharesBalance,
    wstethBalance: data?.wstethBalance,
    usdBalance: usdAmount,
  };
};
