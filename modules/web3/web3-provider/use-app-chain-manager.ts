import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type Dispatch,
} from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useRouter } from 'next/router';

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
  const [isSwitchChainWait, setIsSwitchChainWait] = useState<boolean>(true);
  const router = useRouter();

  const { chainId: walletChainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain({
    mutation: {
      onMutate: () => setIsSwitchChainWait(true),
      onSettled: () => setIsSwitchChainWait(false),
    },
  });

  const supportedChainIds = useMemo(
    () =>
      config.supportedChains.filter((chain) =>
        supportedL2 ? true : !isSDKSupportedL2Chain(chain),
      ),
    [supportedL2],
  );

  // Sync the 'wallet chain id' with the 'app chain id' or use default
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsSwitchChainWait(true);
    };

    const handleRouteChangeComplete = () => {
      if (isConnected) {
        const chainId =
          walletChainId && supportedChainIds.includes(walletChainId)
            ? walletChainId
            : config.defaultChain;

        switchChain({ chainId: chainId });
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [
    switchChain,
    isConnected,
    router.events,
    supportedChainIds,
    walletChainId,
  ]);

  // Sync the 'app chain id' with the 'wallet chain id' or use default
  useEffect(() => {
    if (isConnected) {
      const chainId =
        walletChainId && supportedChainIds.includes(walletChainId)
          ? walletChainId
          : config.defaultChain;

      setAppChainId(chainId);
    }

    setIsSwitchChainWait(false);
  }, [walletChainId, isConnected, supportedChainIds]);

  const switchAppChainId = useCallback<Dispatch<number>>(
    (newChainId: number) => {
      if (supportedChainIds.includes(newChainId)) {
        switchChain({ chainId: newChainId });
      }
    },
    [switchChain, supportedChainIds],
  );

  const [isChainIdOnL2, supportedChainLabels] = useMemo(() => {
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

    return [isChainIdOnL2, supportedChainLabels];
  }, [supportedL2, appChainId, supportedChainIds]);

  const isSupportedChain = useMemo(
    () => (walletChainId ? supportedChainIds.includes(walletChainId) : true),
    [walletChainId, supportedChainIds],
  );

  return {
    chainId: appChainId,
    setChainId: switchAppChainId,
    isSwitchChainWait,

    isChainIdOnL2,
    supportedL2,

    supportedChainLabels,
    supportedChainIds,
    isSupportedChain,
    isChainIdMatched: walletChainId === appChainId,
  };
};
