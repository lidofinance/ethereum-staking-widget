import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';

import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { useDappStatus } from 'modules/web3';
import { bnAmountToNumber, maxBN } from 'utils/bn';
import { standardFetcher } from 'utils/standardFetcher';
import {
  getMellowClaimReward,
  getMellowUserPointsWei,
  type MellowClaimReward,
} from 'features/earn/shared/api/mellow-points';
import { DVV_STATS_ORIGIN } from '../consts';

const transformPoints = (reward?: MellowClaimReward) => {
  const claimable = maxBN(
    BigInt(reward?.claimable_amount ?? 0) - BigInt(reward?.claimed_amount ?? 0),
    0n,
  );
  return {
    claimable,
    usdAmount: reward
      ? bnAmountToNumber(claimable, reward.token.decimals) * reward.token.price
      : 0,
    ...reward,
  };
};

export const useDVVPoints = () => {
  const { address } = useDappStatus();

  return useQuery({
    queryKey: ['dvv', 'points', { address }] as const,
    enabled: !!address,
    queryFn: async ({ queryKey }) => {
      const { address } = queryKey[2];
      invariant(address, 'No address provided');
      const dvvVault = getContractAddress(CHAINS.Mainnet, 'dvvVault');
      invariant(dvvVault, 'No DVV vault address found');

      const mellowBaseUrl = `${DVV_STATS_ORIGIN}/v1/chain/1/users`;

      const userPointsUrl = `${mellowBaseUrl}/${address}`;
      const obolUrl = `${mellowBaseUrl}/${address}/obol`;
      const ssvUrl = `${mellowBaseUrl}/${address}/ssv`;

      const [userPointsRes, obolRes, ssvRes] = await Promise.all([
        standardFetcher<unknown>(userPointsUrl),
        standardFetcher<unknown>(obolUrl),
        standardFetcher<unknown>(ssvUrl),
      ]);

      // Validate here so a malformed response becomes a query error, not a
      // render-time throw that takes the whole route down
      return {
        mellowPoints: getMellowUserPointsWei(userPointsRes, dvvVault),
        obol: transformPoints(getMellowClaimReward(obolRes, dvvVault)),
        ssv: transformPoints(getMellowClaimReward(ssvRes, dvvVault)),
      };
    },
  });
};
