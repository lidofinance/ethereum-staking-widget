import { isAddressEqual, type Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDappStatus } from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { getSTGShareManagerSTRETH } from '../contracts';
import { getWithdrawalParams } from '../withdraw/utils';

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
  const publicClient = usePublicClient();
  const stgVaultAddress = getContractAddress(CHAINS.Mainnet, 'stgVault');
  invariant(stgVaultAddress, 'No STG vault address found');

  const isEnabled = isDappActive && !!address;

  const strethBalanceQuery = useQuery({
    queryKey: ['stg', 'position', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(address, 'No address provided');
      invariant(publicClient, 'Public client is not available');

      const shareManager = getSTGShareManagerSTRETH(publicClient);

      const sharesBalance = await shareManager.read.balanceOf([address]);

      return {
        sharesBalance,
        strethTokenAddress: shareManager.address,
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
      const pointsForVault = userPointsData.find((vault) =>
        isAddressEqual(vault.vault_address, stgVaultAddress),
      );
      return pointsForVault ?? null;
    },
  });

  const usdQuery = useQuery({
    queryKey: ['stg', 'position', 'usd', { address }] as const,
    enabled: isEnabled && !!strethBalanceQuery.data?.sharesBalance,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');
      invariant(
        strethBalanceQuery.data?.sharesBalance,
        'No STRETH balance available',
      );
      const { sharesBalance } = strethBalanceQuery.data;
      const { sharesUSDC } = await getWithdrawalParams({
        shares: sharesBalance,
        publicClient,
      });
      return sharesUSDC;
    },
  });

  const data = isEnabled ? strethBalanceQuery.data : undefined;
  const usdBalance = isEnabled ? usdQuery.data : undefined;

  return {
    ...strethBalanceQuery,
    mellowPoints: Number(
      mellowPointsBalanceQuery.data?.user_mellow_points ?? 0,
    ),
    sharesBalance: data?.sharesBalance,
    usdQuery,
    usdBalance: usdBalance ?? 0n,
  };
};
