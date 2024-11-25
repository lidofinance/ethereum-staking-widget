import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import { useReadContract, usePublicClient } from 'wagmi';

import { PartialCurveAbi } from 'abi/partial-curve-abi';
import { WEI_PER_ETHER } from 'consts/tx';
import { useDappStatus, useWagmiMainnetOnlyConfig } from 'modules/web3';

export const MAINNET_CURVE = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022';

export const useStethEthRate = () => {
  const { chainId } = useDappStatus();
  const wagmiConfig = useWagmiMainnetOnlyConfig();
  const publicClientMainnet = usePublicClient({ config: wagmiConfig });

  const { data, error } = useReadContract({
    address: MAINNET_CURVE,
    abi: PartialCurveAbi,
    functionName: 'get_dy',
    args: [0n, 1n, WEI_PER_ETHER],
    query: {
      enabled: chainId === CHAINS.Mainnet && !!publicClientMainnet,
    },
  });

  if (error || chainId !== 1) return WEI_PER_ETHER;
  return data || null;
};
