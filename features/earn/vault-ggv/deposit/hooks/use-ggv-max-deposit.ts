/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useQuery } from '@tanstack/react-query';
import { useDappStatus, ONE_stETH } from 'modules/web3';
import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import {
  getGGVAccountantContract,
  getGGVLensContract,
  getGGVTellerContract,
  getGGVVaultContract,
} from '../../contracts';
import { getTokenAddress } from 'config/networks/token-address';
import { isGGVAvailable } from '../../utils';

export const INFINITE_DEPOSIT_CAP = 2n ** 112n - 1n;
const PRECISION = ONE_stETH; // 10^18

export const useGGVMaxDeposit = () => {
  const { chainId } = useDappStatus();
  const publicClient = usePublicClient();
  const enabled = isGGVAvailable(chainId);
  return useQuery({
    queryKey: ['ggv', 'maxDeposit', { chainId }],
    enabled: enabled,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');
      const teller = getGGVTellerContract(publicClient);
      const vault = getGGVVaultContract(publicClient);
      const lens = getGGVLensContract(publicClient);
      const accountant = getGGVAccountantContract(publicClient);

      const maxShares = await teller.read.depositCap();
      if (maxShares === INFINITE_DEPOSIT_CAP) {
        return {
          maxShares: null,
          maxWethDeposit: null,
          maxEthDeposit: null,
          maxStethDeposit: null,
          maxWstethDeposit: null,
        };
      }

      const previewArgs = [
        PRECISION,
        vault.address,
        accountant.address,
      ] as const;

      // MATH explanation:
      // rates = ens.previewDeposit converts how many vault shares will be received for 1 ether/steth/wstesth this acts as rate
      // leftShares = maxShares - currentShares - how many shares left to deposit amount
      // we need to convert leftShares back to tokens based on rate
      // rate = shares / tokens
      // token = leftShares / rate
      // PRECISION multiples rate (during previewDeposit) and then divides result
      const [
        maxSharesDeposit,
        maxStethDeposit,
        maxWstethDeposit,
        maxWethDeposit,
      ] = await Promise.all([
        vault.read.totalSupply(),
        lens.read.previewDeposit([
          getTokenAddress(chainId, 'stETH')!,
          ...previewArgs,
        ]),
        lens.read.previewDeposit([
          getTokenAddress(chainId, 'wstETH')!,
          ...previewArgs,
        ]),
        lens.read.previewDeposit([
          getTokenAddress(chainId, 'wETH')!,
          ...previewArgs,
        ]),
      ]).then(([currentShares, ...rates]) => [
        maxShares - currentShares,
        ...rates.map(
          (rate) => ((maxShares - currentShares) * PRECISION) / rate,
        ),
      ]);

      return {
        maxSharesDeposit,
        maxEthDeposit: maxWethDeposit,
        maxStethDeposit,
        maxWstethDeposit,
        maxWethDeposit,
      };
    },
  });
};
