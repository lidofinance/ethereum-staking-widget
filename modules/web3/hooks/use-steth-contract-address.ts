import { LIDO_L2_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk';
import { LidoSDKL2 } from '@lidofinance/lido-ethereum-sdk/l2';
import { useQuery } from '@tanstack/react-query';
import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { useLidoSDK, useLidoSDKL2 } from 'modules/web3';

export const useStETHContractAddress = () => {
  const { stETH } = useLidoSDK();
  // The SDK chain, not the dapp chain: the two differ on the render right
  // after the wallet changes network (the dapp chain follows in an effect),
  // and a check against the dapp chain here used to throw during render
  const { l2, isL2, chainId } = useLidoSDKL2();

  // stETH is not deployed on the staking-only L2s; the query stays idle there
  const isStethAvailable =
    !isL2 ||
    LidoSDKL2.isContractAvailableOn(LIDO_L2_CONTRACT_NAMES.steth, chainId);

  return useQuery({
    queryKey: ['use-steth-contract-address', { chainId, isL2 }],
    enabled: isStethAvailable,
    ...STRATEGY_IMMUTABLE,
    queryFn: () =>
      isL2 ? l2.steth.contractAddress() : stETH.contractAddress(),
  });
};
