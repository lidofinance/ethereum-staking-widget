import { useQuery } from '@tanstack/react-query';
import {
  calcFastStakeWstethByEth,
  calcFastStakeEthByWsteth,
  LIDO_L2_STAKING_QUERY_SCOPE,
} from 'modules/l2-staking';
import { useLidoSDKL2 } from 'modules/web3';

type ConversionOptions = {
  // The pool fee is charged on a stake; pass false to value a balance at the
  // bare oracle price
  includeFee?: boolean;
};

export const useFastStakeConversion = () => {
  const { l2Stake, isL2Stake, chainId } = useLidoSDKL2();
  return useQuery({
    queryKey: [LIDO_L2_STAKING_QUERY_SCOPE, 'conversion', { chainId }],
    enabled: isL2Stake,
    queryFn: async () => {
      const { feeRate, price } = await l2Stake.getFastStakeRate();
      const rate = ({ includeFee = true }: ConversionOptions = {}) =>
        includeFee ? feeRate : 0n;
      return {
        feeRate,
        price,
        ethToWsteth: (ethAmount: bigint, options?: ConversionOptions) =>
          calcFastStakeWstethByEth(ethAmount, rate(options), price),
        wstethToEth: (wstethAmount: bigint, options?: ConversionOptions) =>
          calcFastStakeEthByWsteth(wstethAmount, rate(options), price),
      };
    },
  });
};
