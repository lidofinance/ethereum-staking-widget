import { LIDO_L2_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk';
import { LidoSDKL2 } from '@lidofinance/lido-ethereum-sdk/l2';
import { useQuery } from '@tanstack/react-query';
import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { useDappStatus, useLidoSDK, useLidoSDKL2 } from 'modules/web3';
import invariant from 'tiny-invariant';

export const useStETHContractAddress = () => {
  const { chainId } = useDappStatus();
  const { stETH } = useLidoSDK();
  const { l2, isL2 } = useLidoSDKL2();

  const isStethAvailable =
    !isL2 ||
    LidoSDKL2.isContractAvailableOn(LIDO_L2_CONTRACT_NAMES.steth, chainId);
  invariant(
    isStethAvailable,
    `stETH contract is not available on ${chainId} chain`,
  );

  return useQuery({
    queryKey: ['use-steth-contract-address', { chainId }],
    enabled: !!(isL2 ? l2.steth : stETH),
    ...STRATEGY_IMMUTABLE,
    queryFn: () =>
      isL2 ? l2.steth.contractAddress() : stETH.contractAddress(),
  });
};
