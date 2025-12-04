import { isAddressEqual, type Address } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { standardFetcher } from 'utils/standardFetcher';
import { getSTGShareManagerSTRETH } from '../contracts';
import { getWithdrawalParams } from '../withdraw/utils';
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
      invariant(publicClientMainnet, 'Public client is not available');

      const shareManager = getSTGShareManagerSTRETH(publicClientMainnet);

      const strethSharesBalance = await shareManager.read.balanceOf([address]);

      return {
        strethSharesBalance,
        strethTokenAddress: shareManager.address,
      };
    },
  });

  const strethShares = strethBalanceQuery.data?.strethSharesBalance ?? 0n;

  const mellowPointsBalanceQuery = useQuery({
    queryKey: ['stg', 'mellow-points', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
      // TODO: add zod validation
      const mellowBaseUrl = `https://points.mellow.finance/v1/chain/1/users`;
      const userPointsUrl = `${mellowBaseUrl}/${address}`;

      const userPointsData =
        await standardFetcher<UserPointsResponse>(userPointsUrl);
      const pointsForVault = userPointsData.find((vault) =>
        isAddressEqual(vault.vault_address, stgVaultAddress),
      );

      return pointsForVault ?? null;
    },
  });

  const strethToWstethQuery = useQuery({
    queryKey: [
      'stg',
      'position',
      'usd',
      { shares: String(strethShares) },
    ] as const,
    enabled: isEnabled && !!strethBalanceQuery.data?.strethSharesBalance,
    queryFn: async () => {
      invariant(publicClientMainnet, 'Public client is not available');

      const { assets: assetsWsteth } = await getWithdrawalParams({
        shares: strethShares,
        publicClient: publicClientMainnet,
      });
      return assetsWsteth;
    },
  });

  const data = isEnabled ? strethBalanceQuery.data : undefined;
  const wsteth = strethToWstethQuery.data;
  const mellowPoints = mellowPointsBalanceQuery.data?.user_mellow_points
    ? Number(mellowPointsBalanceQuery.data.user_mellow_points)
    : undefined;

  const { usdAmount, ...usdQuery } = useWstethUsd(
    wsteth,
    publicClientMainnet.chain?.id,
  );

  return {
    ...strethBalanceQuery,
    isLoading:
      strethBalanceQuery.isLoading ||
      mellowPointsBalanceQuery.isLoading ||
      strethToWstethQuery.isLoading,
    data,
    mellowPoints,
    strethSharesBalance: data?.strethSharesBalance,
    usdQuery,
    usdBalance: usdAmount ?? 0,
  };
};
