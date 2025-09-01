import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';

import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';

import {
  getDVVDepositWrapperContract,
  getDVVVaultContract,
} from '../../contracts';

import type { DVVDepositLimitReason } from '../types';
import { maxUint256 } from 'viem';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';

type DVVDepositLimit = {
  maxDepositETH: bigint | null;
  reason: DVVDepositLimitReason | null;
};

export const useDVVDepositLimit = () => {
  const { address } = useDappStatus();

  const { publicClientMainnet } = useMainnetOnlyWagmi();

  return useQuery({
    queryKey: ['dvv', 'deposit-limit', { address }],
    enabled: !!address,
    queryFn: async (): Promise<DVVDepositLimit> => {
      invariant(address, 'Address is required');
      invariant(publicClientMainnet?.chain?.id, 'Public client is required');

      const vault = getDVVVaultContract(publicClientMainnet);
      const wrapper = getDVVDepositWrapperContract(publicClientMainnet);
      const lidoWrap = new LidoSDKWrap({
        chainId: publicClientMainnet.chain.id,
        rpcProvider: publicClientMainnet,
        logMode: 'none',
      });

      const [
        isWhitelistEnabled,
        isAddressWhitelisted,
        isDepositPaused,
        maxDepositWsteth,
      ] = await Promise.all([
        wrapper.read.depositWhitelist([vault.address]),
        wrapper.read.isDepositWhitelist([vault.address, address]),
        vault.read.depositPause(),
        vault.read.maxDeposit([wrapper.address]),
      ]);

      if (isDepositPaused) {
        return {
          maxDepositETH: 0n,
          reason: 'deposit-paused',
        };
      }

      if (isWhitelistEnabled && !isAddressWhitelisted) {
        return {
          maxDepositETH: 0n,
          reason: 'non-whitelisted',
        };
      }

      if (maxDepositWsteth === 0n) {
        return {
          maxDepositETH: 0n,
          reason: 'deposit-limit-reached',
        };
      }

      if (maxDepositWsteth === maxUint256) {
        return {
          maxDepositETH: null,
          reason: null,
        };
      }

      //  ETH -> stETH at 1:1 in the vault contract
      const maxDepositETH =
        await lidoWrap.convertWstethToSteth(maxDepositWsteth);

      if (maxDepositETH === 0n) {
        return {
          maxDepositETH: 0n,
          reason: 'deposit-limit-reached',
        };
      }

      return {
        maxDepositETH,
        reason: null,
      };
    },
  });
};
