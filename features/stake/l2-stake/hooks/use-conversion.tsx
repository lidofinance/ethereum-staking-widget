import { useQuery } from '@tanstack/react-query';
import {
  calcFastStakeWstethByEth,
  calcFastStakeEthByWsteth,
  LIDO_L2_STAKING_QUERY_SCOPE,
} from 'modules/l2-staking';
import { useLidoSDKL2 } from 'modules/web3';

export const useFastStakeConversion = () => {
  const { l2Stake, isL2Stake, chainId } = useLidoSDKL2();
  return useQuery({
    queryKey: [LIDO_L2_STAKING_QUERY_SCOPE, 'conversion', { chainId }],
    enabled: isL2Stake,
    queryFn: async () => {
      const { feeRate, price } = await l2Stake.getFastStakeRate();
      return {
        feeRate,
        price,
        ethToWsteth: (ethAmount: bigint) =>
          calcFastStakeWstethByEth(ethAmount, feeRate, price),
        wstethToEth: (wstethAmount: bigint) =>
          calcFastStakeEthByWsteth(wstethAmount, feeRate, price),
      };
    },
  });
};
