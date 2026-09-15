import { useQuery } from '@tanstack/react-query';
import { getContract } from 'viem';
import invariant from 'tiny-invariant';

import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useMainnetOnlyWagmi } from 'modules/web3';

import { FEE_MANAGER_ABI } from '../abi';
import { MELLOW_VAULTS_QUERY_SCOPE } from '../consts';
import { VaultContract } from '../types/contracts';
import { formatActiveFees } from '../utils/format-fee-d6';

export const useActiveFees = ({ vault }: { vault: VaultContract }) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const query = useQuery({
    queryKey: [
      MELLOW_VAULTS_QUERY_SCOPE,
      'active-fees',
      vault.address,
    ] as const,
    ...STRATEGY_CONSTANT,
    queryFn: async () => {
      invariant(publicClientMainnet, 'Public client is not available');

      // Resolved on-chain rather than from config
      const feeManagerAddress = await vault.read.feeManager();

      const feeManager = getContract({
        abi: FEE_MANAGER_ABI,
        address: feeManagerAddress,
        client: { public: publicClientMainnet },
      });

      const [protocolFeeD6, performanceFeeD6] = await Promise.all([
        feeManager.read.protocolFeeD6(),
        feeManager.read.performanceFeeD6(),
      ]);

      return { protocolFeeD6, performanceFeeD6 };
    },
    select: formatActiveFees,
  });

  return {
    isLoading: query.isLoading,
    value: query.data,
  };
};
