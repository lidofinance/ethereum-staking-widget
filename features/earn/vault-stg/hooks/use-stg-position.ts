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

      const sharesBalance = await shareManager.read.balanceOf([address]);

      return {
        sharesBalance,
        strethTokenAddress: shareManager.address,
      };
    },
  });

  const shares = strethBalanceQuery.data?.sharesBalance ?? 0n;

  const mellowPointsBalanceQuery = useQuery({
    queryKey: ['stg', 'mellow-points', { address }] as const,
    enabled: isEnabled,
    queryFn: async () => {
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
    queryKey: ['stg', 'position', 'usd', { shares: Number(shares) }] as const,
    enabled: isEnabled && !!strethBalanceQuery.data?.sharesBalance,
    queryFn: async () => {
      invariant(publicClientMainnet, 'Public client is not available');

      const { assets } = await getWithdrawalParams({
        shares,
        publicClient: publicClientMainnet,
      });
      return assets;
    },
  });

  const data = isEnabled ? strethBalanceQuery.data : undefined;
  const wsteth = strethToWstethQuery.data;

  const { usdAmount, ...usdQuery } = useWstethUsd(
    wsteth,
    publicClientMainnet.chain?.id,
  );

  return {
    ...strethBalanceQuery,
    mellowPoints: Number(
      mellowPointsBalanceQuery.data?.user_mellow_points ?? 0,
    ),
    sharesBalance: data?.sharesBalance,
    usdQuery,
    usdBalance: usdAmount ?? 0,
  };
};
