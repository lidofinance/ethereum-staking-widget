import { isAddressEqual, type Address } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { getSTGShareManagerSTRETH } from '../contracts';

type UserPointsResponse = {
  user_address: Address;
  user_referal_points: string;
  user_vault_balance: number;
  timestamp: number;
  vault_address: Address;
  user_mellow_points: string;
  user_symbiotic_points: string;
  user_merits_points: string;
}[];

export const useSTGPosition = () => {
  const { address, isDappActive } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const stgVaultAddress = getContractAddress(CHAINS.Mainnet, 'stgVault');
  invariant(stgVaultAddress, 'No STG vault address found');

  const isEnabled = isDappActive && !!address;

  const strethBalanceQuery = useQuery({
    queryKey: ['stg', 'position', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(address, 'No address provided');
      const shareManager = getSTGShareManagerSTRETH(publicClientMainnet);

      const sharesBalance = await shareManager.read.balanceOf([address]);

      // const wstethBalance = await vault.read.convertToAssets([sharesBalance]);

      return {
        sharesBalance,
        //   wstethBalance,
      };
    },
  });

  const mellowPointsBalanceQuery = useQuery({
    queryKey: ['stg', 'mellow-points', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
      const mellowBaseUrl = `https://points.mellow.finance/v1/chain/1/users`;
      const userPointsUrl = `${mellowBaseUrl}/${address}`;

      const userPointsRes = await fetch(userPointsUrl);
      const userPointsData = (await userPointsRes.json()) as UserPointsResponse;
      return userPointsData.find((vault) =>
        isAddressEqual(vault.vault_address, stgVaultAddress),
      );
    },
  });

  const data = isEnabled ? strethBalanceQuery.data : undefined;

  // const { usdAmount, ...usdQuery } = useWstethUsd(
  //   data?.wstethBalance,
  //   publicClientMainnet.chain?.id,
  // );

  return {
    ...strethBalanceQuery,
    mellowPoints: Number(
      mellowPointsBalanceQuery.data?.user_mellow_points ?? 0,
    ),
    sharesBalance: data?.sharesBalance,
    // usdQuery,
    // dvvTokenAddress: data?.dvvTokenAddress,
    // wstethBalance: data?.wstethBalance,
    // usdBalance: usdAmount,
  };
};
