import invariant from 'tiny-invariant';
import { isAddressEqual, type Address } from 'viem';
import { useQuery } from '@tanstack/react-query';

import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { useDappStatus } from 'modules/web3';
import { bnAmountToNumber } from 'utils/bn';

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

type UserClaimPointsResponse = {
  vaults: {
    chain_id: number;
    vault: Address;
    rewards: [
      {
        chain_id: number;
        token: {
          chain_id: number;
          symbol: string;
          address: Address;
          decimals: number;
          price: number;
        };
        claimable_amount: string;
        claimed_amount: string;
        claim_contract_address: string;
        claim_index: number;
        claim_url: string;
      },
    ];
  }[];
};

const transformPoints = (
  reward?: UserClaimPointsResponse['vaults'][number]['rewards'][number],
) => ({
  claimable: BigInt(reward?.claimable_amount ?? 0),
  claimed: BigInt(reward?.claimed_amount ?? 0),
  usdAmount: reward
    ? bnAmountToNumber(BigInt(reward.claimed_amount), reward.token.decimals) *
      reward.token.price
    : 0,
  ...reward,
});

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

      const mellowBaseUrl = `https://points.mellow.finance/v1/chain/1/users`;

      const userPointsUrl = `${mellowBaseUrl}/${address}`;
      const obolUrl = `${mellowBaseUrl}/${address}/obol`;
      const ssvUrl = `${mellowBaseUrl}/${address}/ssv`;

      const [userPointsRes, obolRes, ssvRes] = await Promise.all([
        fetch(userPointsUrl)
          .then((res) => res.json() as Promise<UserPointsResponse>)
          .then((data) =>
            data.find((vault) => isAddressEqual(vault.vault_address, dvvVault)),
          ),
        fetch(obolUrl)
          .then((res) => res.json() as Promise<UserClaimPointsResponse>)
          .then(
            (data) =>
              data.vaults.find((vault) => isAddressEqual(vault.vault, dvvVault))
                ?.rewards[0],
          ),
        fetch(ssvUrl)
          .then((res) => res.json() as Promise<UserClaimPointsResponse>)
          .then(
            (data) =>
              data.vaults.find((vault) => isAddressEqual(vault.vault, dvvVault))
                ?.rewards[0],
          ),
      ]);

      return {
        mellowPoints: Number(userPointsRes?.user_mellow_points ?? 0),
        obol: transformPoints(obolRes),
        ssv: transformPoints(ssvRes),
      };
    },
  });
};
