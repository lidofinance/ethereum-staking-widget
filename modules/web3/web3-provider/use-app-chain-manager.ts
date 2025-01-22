import { useCallback, useMemo, useEffect, type Dispatch } from 'react';
import { useAccount, useConfig, useChainId, useSwitchChain } from 'wagmi';

import { config } from 'config';
import { isSDKSupportedL2Chain } from 'consts/chains';

import {
  getChainTypeByChainId,
  DAPP_CHAIN_TYPE,
  SupportedChainLabels,
} from '../consts';
import { wagmiChainMap } from './web3-provider';

export const useAppChainManager = (supportedL2: boolean) => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // reset internal wagmi state after disconnect
  const { isConnected } = useAccount();
  const wagmiConfig = useConfig();
  useEffect(() => {
    if (isConnected) {
      return () => {
        // protecs from side effect double run
        if (!wagmiConfig.state.current) {
          switchChain({
            chainId: config.defaultChain,
          });
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const supportedChainIds = useMemo(
    () =>
      config.supportedChains.filter((chain) =>
        supportedL2 ? true : !isSDKSupportedL2Chain(chain),
      ),
    [supportedL2],
  );

  // Supported chain over the page
  const dappChainId = useMemo(() => {
    return supportedChainIds.includes(chainId) ? chainId : config.defaultChain;
  }, [chainId, supportedChainIds]);

  const switchDappChainId = useCallback<Dispatch<number>>(
    (newChainId: number) => {
      if (supportedChainIds.includes(newChainId)) {
        switchChain({ chainId: newChainId });
      }
    },
    [switchChain, supportedChainIds],
  );

  const [isChainIdOnL2, supportedChainLabels] = useMemo(() => {
    // all L2 networks supported by the widget will be supported in SDK
    const isChainIdOnL2 = isSDKSupportedL2Chain(dappChainId);

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
  }, [dappChainId, supportedChainIds]);

  // Means supported chain on the page (L1, L2)
  const isSupportedChain = useMemo(
    () => (chainId ? supportedChainIds.includes(chainId) : true),
    [chainId, supportedChainIds],
  );

  return {
    chainId: dappChainId,
    setChainId: switchDappChainId,

    isTestnet: wagmiChainMap[dappChainId]?.testnet || false,
    isChainIdOnL2,
    supportedL2,

    isSupportedChain,
    supportedChainIds,
    supportedChainLabels,
  };
};
