/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { maxUint256 } from 'viem';

import { getTokenAddress } from 'config/networks/token-address';
import { useMainnetOnlyWagmi } from 'modules/web3';

import { getGGVQueueContract } from '../../contracts';
import type { GGVWithdrawStoppedReason } from '../types';

export const useGGVWithdrawalState = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  return useQuery({
    queryKey: ['ggv', 'withdrawal-state'],
    queryFn: async () => {
      const queue = getGGVQueueContract(publicClientMainnet);
      const wstethAddress = getTokenAddress(
        publicClientMainnet.chain!.id,
        'wstETH',
      );
      invariant(wstethAddress, 'wstETH address is required');

      const [withdrawableAsset, isPaused] = await Promise.all([
        queue.read.withdrawAssets([wstethAddress]),
        queue.read.isPaused(),
      ]);

      const [
        allowWithdraws,
        secondsToMaturity,
        minimumSecondsToDeadline,
        minDiscount,
        maxDiscount,
        minimumShares,
        withdrawCapacity,
      ] = withdrawableAsset;

      const canWithdraw = !isPaused && allowWithdraws && withdrawCapacity > 0n;
      let reason: GGVWithdrawStoppedReason = null;

      if (isPaused) {
        reason = 'paused';
      }

      if (!allowWithdraws) {
        reason = 'withdrawal-stopped';
      }

      if (withdrawCapacity === 0n) {
        reason = 'withdrawal-zero-capacity';
      }

      return {
        canWithdraw,
        reason,
        secondsToMaturity,
        minimumSecondsToDeadline,
        minDiscount,
        maxDiscount,
        minimumShares,
        withdrawCapacity:
          withdrawCapacity === maxUint256 ? null : withdrawCapacity,
      };
    },
  });
};
