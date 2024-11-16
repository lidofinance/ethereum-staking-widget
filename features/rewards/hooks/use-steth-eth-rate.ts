import { parseAbiItem, encodeFunctionData, decodeAbiParameters } from 'viem';
import { usePublicClient } from 'wagmi';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useDappStatus } from 'modules/web3';

export const MAINNET_CURVE = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022';

// TODO: conts
const WeiPerEther = BigInt(10 ** 18);

export const useStethEthRate = () => {
  const { chainId } = useDappStatus();
  const publicClientMainnet = usePublicClient({ chainId: CHAINS.Mainnet });

  const { data, error } = useLidoQuery({
    queryKey: ['steth-eth-rate', chainId],
    strategy: STRATEGY_LAZY,
    enabled: !!(chainId === CHAINS.Mainnet && publicClientMainnet),
    queryFn: async () => {
      if (chainId !== 1 || !publicClientMainnet) return WeiPerEther;

      const functionSignature = parseAbiItem(
        'function get_dy(int128 i, int128 j, uint256 dx) view returns (uint256)',
      );

      const callData = encodeFunctionData({
        abi: [functionSignature],
        functionName: 'get_dy',
        args: [BigInt(0), BigInt(1), BigInt(10 ** 18)],
      });

      const result = await publicClientMainnet.call({
        to: MAINNET_CURVE,
        data: callData,
      });

      const decoded = decodeAbiParameters(
        functionSignature.outputs || [],
        result.data as `0x${string}`, // view returns (uint256)
      );

      return decoded[0];
    },
  });

  if (error || chainId !== 1) return BigInt(10 ** 18);
  return data || null;
};
