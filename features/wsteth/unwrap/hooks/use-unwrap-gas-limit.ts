import { config } from 'config';
import { UNWRAP_GAS_LIMIT, UNWRAP_L2_GAS_LIMIT } from 'consts/tx';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK, useDappStatus } from 'modules/web3';
import { useLidoQuery } from 'shared/hooks/use-lido-query';

export const useUnwrapGasLimit = () => {
  const { isDappActiveOnL2 } = useDappStatus();
  const { l2, isL2, wrap, core } = useLidoSDK();

  const fallback = isDappActiveOnL2 ? UNWRAP_L2_GAS_LIMIT : UNWRAP_GAS_LIMIT;

  const { data } = useLidoQuery<bigint>({
    queryKey: ['unwrap-gas-limit', isDappActiveOnL2, core.chainId],
    queryFn: async () => {
      try {
        const contract = isL2
          ? await l2.getContract()
          : await wrap.getContractWstETH();

        return await contract.estimateGas.unwrap([config.ESTIMATE_AMOUNT], {
          account: config.ESTIMATE_ACCOUNT,
        });
      } catch (error) {
        console.warn(error);
        return fallback;
      }
    },
    strategy: STRATEGY_LAZY,
  });

  return data ?? fallback;
};
