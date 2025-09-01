import { type Address } from 'viem';
import { useQuery } from '@tanstack/react-query';

import { useEthUsd } from 'shared/hooks/use-eth-usd';

import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import {
  getGGVAccountantContract,
  getGGVLensContract,
  getGGVVaultContract,
} from '../contracts';

export const useGGVPosition = () => {
  const { address, isDappActive } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const isEnabled = isDappActive && !!address;

  const query = useQuery({
    queryKey: ['ggv', 'position', { address }] as const,
    enabled: isEnabled,
    queryFn: async ({ queryKey }) => {
      const address = queryKey[2].address as Address;
      const vault = getGGVVaultContract(publicClientMainnet);
      const accountant = getGGVAccountantContract(publicClientMainnet);
      const lens = getGGVLensContract(publicClientMainnet);

      // lens helper contains shares and underlying token balance fetchers
      const [sharesBalance, wethBalance] = await Promise.all([
        // fetch vault position from lens helper
        lens.read.balanceOf([address, vault.address]),
        // fetch vault position in WETH from lens helper
        lens.read.balanceOfInAssets([
          address,
          vault.address,
          accountant.address,
        ]),
      ]);

      return {
        sharesBalance,
        wethBalance,
        ggvTokenAddress: vault.address,
      };
    },
  });

  const data = isEnabled ? query.data : undefined;

  const { usdAmount, ...usdQuery } = useEthUsd(data?.wethBalance);

  return {
    ...query,
    usdQuery,
    ggvTokenAddress: data?.ggvTokenAddress,
    sharesBalance: data?.sharesBalance,
    wethBalance: data?.wethBalance,
    usdBalance: usdAmount,
  };
};
