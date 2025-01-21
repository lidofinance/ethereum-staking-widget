import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type Dispatch,
} from 'react';
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
  const [dappChainId, setDappChainId] = useState<number>(config.defaultChain);

  // Hack for launching widget (see: "Sync the 'app chain id' with the 'wallet chain id' or use default")
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const { chainId: walletChainId, isConnected } = useAccount();
  const { switchChain, isPending: isSwitchChainPending } = useSwitchChain();

  const supportedChainIds = useMemo(
    () =>
      config.supportedChains.filter((chain) =>
        supportedL2 ? true : !isSDKSupportedL2Chain(chain),
      ),
    [supportedL2],
  );

  // Sync the 'app chain id' with the 'wallet chain id' or use default
  useEffect(() => {
    if (isConnected) {
      const chainId =
        walletChainId && supportedChainIds.includes(walletChainId)
          ? walletChainId
          : config.defaultChain;

      setDappChainId(chainId);
    }

    // Hack for launching widget (at the moment of launching, the wallet network and widget network may not match)
    setIsMounted(true);
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
      // all L2 networks supported by the widget will be supported in SDK
      supportedL2 && isSDKSupportedL2Chain(dappChainId);

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
  }, [supportedL2, dappChainId, supportedChainIds]);

  const isSupportedChain = useMemo(
    () => (walletChainId ? supportedChainIds.includes(walletChainId) : true),
    [walletChainId, supportedChainIds],
  );

  return {
    chainId: dappChainId,
    setChainId: switchAppChainId,
    isSwitchChainWait: !isMounted || isSwitchChainPending,

    isTestnet: wagmiChainMap[dappChainId]?.isTestnet || false,
    isChainIdOnL2,
    supportedL2,

    supportedChainLabels,
    supportedChainIds,
    isSupportedChain,
    isChainIdMatched: walletChainId === dappChainId,
  };
};
