import { useCallback, useMemo, useEffect } from 'react';
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
  const { switchChain, switchChainAsync } = useSwitchChain();

  // reset internal wagmi state after disconnect
  const { isConnected, chainId: walletChain } = useAccount();
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

  const switchChainId = useCallback(
    async (newChainId: number): Promise<void> => {
      if (walletChain === newChainId) return;

      if (!supportedChainIds.includes(newChainId)) {
        throw new Error(
          `Error switching chain (${newChainId} is unsupported chain)`,
        );
      }

      const timeoutPromise = new Promise<void>((_, reject) =>
        setTimeout(
          () => reject(new Error('Error switching chain (timeout)')),
          5000,
        ),
      );

      await Promise.race([
        switchChainAsync({ chainId: newChainId }),
        timeoutPromise,
      ]);
    },
    [supportedChainIds, switchChainAsync, walletChain],
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

  return {
    chainId: dappChainId,
    switchChainId,

    isTestnet: wagmiChainMap[dappChainId]?.testnet || false,
    isChainIdOnL2,
    supportedL2,

    isSupportedChain: walletChain
      ? supportedChainIds.includes(walletChain)
      : true,
    supportedChainIds,
    supportedChainLabels,
  };
};
