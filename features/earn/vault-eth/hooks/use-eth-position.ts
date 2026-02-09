import { isAddressEqual, type Address } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { standardFetcher } from 'utils/standardFetcher';
import { getETHShareManagerEARNETH } from '../contracts';
// import { getWithdrawalParams } from '../withdraw/utils';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';

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

export const useETHPosition = () => {
  const { address, isDappActive } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const ethVaultAddress = getContractAddress(CHAINS.Mainnet, 'ethVault');
  invariant(ethVaultAddress, 'No ETH vault address found');

  const isEnabled = isDappActive && !!address;

  const earnethBalanceQuery = useQuery({
    queryKey: ['earn', 'eth', 'position', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(address, 'No address provided');
      invariant(publicClientMainnet, 'Public client is not available');

      const shareManager = getETHShareManagerEARNETH(publicClientMainnet);

      const earnethSharesBalance = await shareManager.read.balanceOf([address]);

      return {
        earnethSharesBalance,
        earnethTokenAddress: shareManager.address,
      };
    },
  });

  const earnethShares = earnethBalanceQuery.data?.earnethSharesBalance ?? 0n;

  const mellowPointsBalanceQuery = useQuery({
    queryKey: ['earn', 'eth', 'mellow-points', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
      // TODO: add zod validation
      const mellowBaseUrl = ``; // TODO: UPDATE
      const userPointsUrl = `${mellowBaseUrl}/${address}`;

      const userPointsData =
        await standardFetcher<UserPointsResponse>(userPointsUrl);
      const pointsForVault = userPointsData.find((vault) =>
        isAddressEqual(vault.vault_address, ethVaultAddress),
      );

      return pointsForVault ?? null;
    },
  });

  const earnethToWstethQuery = useQuery({
    queryKey: [
      'earn',
      'eth',
      'position',
      'usd',
      { shares: String(earnethShares) },
    ] as const,
    enabled: isEnabled && !!earnethBalanceQuery.data?.earnethSharesBalance,
    queryFn: async () => {
      invariant(publicClientMainnet, 'Public client is not available');

      // const { assets: assetsWsteth } = await getWithdrawalParams({
      //   shares: earnethShares,
      //   publicClient: publicClientMainnet,
      // });

      const assetsWsteth = 0n; // TODO: UPDATE with real call to getWithdrawalParams

      return assetsWsteth;
    },
  });

  const data = isEnabled ? earnethBalanceQuery.data : undefined;
  const wsteth = earnethToWstethQuery.data;
  const mellowPoints = mellowPointsBalanceQuery.data?.user_mellow_points
    ? Number(mellowPointsBalanceQuery.data.user_mellow_points)
    : undefined;

  const { usdAmount, ...usdQuery } = useWstethUsd(
    wsteth,
    publicClientMainnet.chain?.id,
  );

  return {
    ...earnethBalanceQuery,
    isLoading:
      earnethBalanceQuery.isLoading ||
      mellowPointsBalanceQuery.isLoading ||
      earnethToWstethQuery.isLoading,
    data,
    mellowPoints,
    earnethSharesBalance: data?.earnethSharesBalance,
    usdQuery,
    usdBalance: usdAmount ?? 0,
  };
};
