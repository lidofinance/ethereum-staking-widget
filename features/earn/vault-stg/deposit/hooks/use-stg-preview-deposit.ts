import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { STGDepositFormValues } from '../form-context/types';
import {
  getSTGCollectorContract,
  getSTGDepositQueueContract,
} from '../../contracts';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { useEthUsd } from 'shared/hooks/use-eth-usd';

export type DepositParams = {
  isDepositPossible: boolean;
  isDepositorWhitelisted: boolean;
  isMerkleProofRequired: boolean;
  asset: string; // address as hex string
  shares: bigint;
  sharesUSDC: bigint;
  assets: bigint;
  assetsUSDC: bigint;
  eta: bigint;
};

export const useSTGPreviewDeposit = ({
  amount,
  token = 'ETH',
}: {
  amount?: STGDepositFormValues['amount'];
  token?: STGDepositFormValues['token'];
}) => {
  const { isDappActive, address: userAddress } = useDappStatus();
  const publicClient = usePublicClient();

  const isEnabled = isDappActive && amount != null;

  const debouncedAmount = useDebouncedValue(amount, 500);
  const isDebounced = isEnabled && amount !== debouncedAmount;

  const query = useQuery({
    queryKey: [
      'stg',
      'preview-deposit',
      {
        amount: isEnabled ? debouncedAmount?.toString() : null,
      },
    ] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');

      const contract = getSTGCollectorContract(publicClient);
      const depositQueueContract = getSTGDepositQueueContract({
        publicClient,
        token,
      });

      if (!debouncedAmount)
        return {
          shares: 0n,
        };

      const { shares } = (await contract.read.getDepositParams([
        depositQueueContract.address, // queue
        debouncedAmount, // assets
        userAddress, // account
        ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 86400, 3600], // config
      ])) as DepositParams;

      return {
        shares,
      };
    },
  });

  const wstethUsdQuery = useWstethUsd(debouncedAmount ?? 0n);
  const ethUsdQuery = useEthUsd(debouncedAmount ?? 0n);
  const usdQuery = token === 'wstETH' ? wstethUsdQuery : ethUsdQuery;

  return {
    isLoading: isDebounced || query.isLoading || usdQuery?.isLoading,
    data: {
      shares: query.data?.shares,
      usd: usdQuery.usdAmount,
    },
  };
};
