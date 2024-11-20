import type { Address } from 'viem';
import { parseAbiItem, encodeFunctionData, decodeAbiParameters } from 'viem';
import { usePublicClient } from 'wagmi';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { WEI_PER_ETHER } from 'consts/tx';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { useDappStatus } from 'modules/web3';

export const MAINNET_CURVE = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022';

export const useStethEthRate = () => {
  const { chainId } = useDappStatus();
  const publicClientMainnet = usePublicClient({ chainId: CHAINS.Mainnet });

  const { data, error } = useLidoQuery({
    queryKey: ['steth-eth-rate', chainId],
    strategy: STRATEGY_LAZY,
    enabled: !!(chainId === CHAINS.Mainnet && publicClientMainnet),
    queryFn: async () => {
      if (chainId !== 1 || !publicClientMainnet) return WEI_PER_ETHER;

      const functionSignature = parseAbiItem(
        'function get_dy(int128 i, int128 j, uint256 dx) view returns (uint256)',
      );

      const callData = encodeFunctionData({
        abi: [functionSignature],
        functionName: 'get_dy',
        args: [BigInt(0), BigInt(1), WEI_PER_ETHER],
      });

      const result = await publicClientMainnet.call({
        to: MAINNET_CURVE,
        data: callData,
      });

      const decoded = decodeAbiParameters(
        functionSignature.outputs || [],
        result.data as Address, // view returns (uint256)
      );

      return decoded[0];
    },
  });

  if (error || chainId !== 1) return WEI_PER_ETHER;
  return data || null;
};
