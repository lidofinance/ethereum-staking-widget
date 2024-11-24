import { useQuery } from '@tanstack/react-query';
import { config } from 'config';
import { UNWRAP_GAS_LIMIT, UNWRAP_L2_GAS_LIMIT } from 'consts/tx';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK, useDappStatus, ESTIMATE_AMOUNT } from 'modules/web3';

export const useUnwrapGasLimit = () => {
  const { isDappActiveOnL2 } = useDappStatus();
  const { l2, isL2, wrap, core } = useLidoSDK();

  const fallback = isDappActiveOnL2 ? UNWRAP_L2_GAS_LIMIT : UNWRAP_GAS_LIMIT;

  const { data } = useQuery<bigint>({
    queryKey: ['unwrap-gas-limit', isDappActiveOnL2, core.chainId],
    ...STRATEGY_LAZY,
    queryFn: async () => {
      try {
        const contract = isL2
          ? await l2.getContract()
          : await wrap.getContractWstETH();

        return await contract.estimateGas.unwrap([ESTIMATE_AMOUNT], {
          account: config.ESTIMATE_ACCOUNT,
        });
      } catch (error) {
        console.warn(error);
        return fallback;
      }
    },
  });

  return data ?? fallback;
};
