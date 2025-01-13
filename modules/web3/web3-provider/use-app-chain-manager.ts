import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';

import { config } from 'config';
import { isSDKSupportedL2Chain } from 'consts/chains';

import {
  getChainTypeByChainId,
  DAPP_CHAIN_TYPE,
  SupportedChainLabels,
} from '../consts';
import { wagmiChainMap } from './web3-provider';

export const useAppChainManager = (supportedL2: boolean) => {
  const [appChainId, setAppChainId] = useState<number>(config.defaultChain);
  const [isSwitchChainWait, setIsSwitchChainWait] = useState<boolean>(false);

  const { chainId: walletChainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain({
    mutation: {
      onMutate: () => setIsSwitchChainWait(true),
      onSettled: () => setIsSwitchChainWait(false),
    },
  });

  const supportedChainIds = config.supportedChains.filter((chain) =>
    supportedL2 ? true : !isSDKSupportedL2Chain(chain),
  );

  // Sync 'app chain id' with the 'wallet chain id' or use default
  useEffect(() => {
    if (isConnected) {
      const chainId =
        walletChainId && supportedChainIds.includes(walletChainId)
          ? walletChainId
          : config.defaultChain;

      setAppChainId(chainId);
    }
  }, [walletChainId, isConnected, supportedChainIds]);

  const switchAppChainId = useCallback<React.Dispatch<number>>(
    (newChainId: number) => {
      if (supportedChainIds.includes(newChainId)) {
        switchChain({ chainId: newChainId });
      }
    },
    [switchChain, supportedChainIds],
  );

  const isChainIdOnL2 =
    supportedL2 &&
    getChainTypeByChainId(appChainId) === DAPP_CHAIN_TYPE.Optimism;

  const supportedChainTypes = supportedChainIds
    .map(getChainTypeByChainId)
    .filter(
      (chainType, index, array) =>
        // duplicate/invalid pruning + stable order
        chainType && array.indexOf(chainType) === index,
    ) as DAPP_CHAIN_TYPE[];

  const getChainLabelByType = (chainType: DAPP_CHAIN_TYPE) => {
    // all testnets for chainType
    const testnetsForType = supportedChainIds
      .filter((id) => chainType == getChainTypeByChainId(id))
      .map((id) => wagmiChainMap[id])
      .filter((chain) => chain.testnet)
      .map((chain) => chain.name);

    return (
      chainType +
      (testnetsForType.length > 0 ? `(${testnetsForType.join(',')})` : '')
    );
  };

  const supportedChainLabels = supportedChainTypes.reduce(
    (acc, chainType) => ({
      ...acc,
      [chainType]: getChainLabelByType(chainType),
    }),
    {},
  ) as SupportedChainLabels;

  return {
    chainId: appChainId,
    setChainId: switchAppChainId,
    isSwitchChainWait,

    isChainIdOnL2,
    supportedL2,

    supportedChainLabels,
    supportedChainIds,
    isSupportedChain: walletChainId
      ? supportedChainIds.includes(walletChainId)
      : true,
    isChainIdMatched: walletChainId === appChainId,
  };
};
