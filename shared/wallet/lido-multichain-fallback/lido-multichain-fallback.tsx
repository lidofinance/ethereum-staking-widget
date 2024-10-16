import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';

import { BlockProps, Link } from '@lidofinance/lido-ui';

import { ReactComponent as ArbitrumLogo } from 'assets/icons/lido-multichain/arbitrum.svg';
import { ReactComponent as BaseLogo } from 'assets/icons/lido-multichain/base.svg';
import { ReactComponent as LineaLogo } from 'assets/icons/lido-multichain/linea.svg';
import { ReactComponent as MantleLogo } from 'assets/icons/lido-multichain/mantle.svg';
import { ReactComponent as OptimismLogo } from 'assets/icons/lido-multichain/optimism.svg';
import { ReactComponent as PolygonLogo } from 'assets/icons/lido-multichain/polygon.svg';
import { ReactComponent as ZkSyncLogo } from 'assets/icons/lido-multichain/zk-sync.svg';
import { ReactComponent as ScrollLogo } from 'assets/icons/lido-multichain/scroll.svg';
import { ReactComponent as BNBLogo } from 'assets/icons/lido-multichain/bnb.svg';
import { ReactComponent as ModeLogo } from 'assets/icons/lido-multichain/mode.svg';

import { config } from 'config';
import { useUserConfig } from 'config/user-config';
import { CHAINS, LIDO_MULTICHAIN_CHAINS } from 'consts/chains';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { OPTIMISM, ETHEREUM } from 'modules/web3/web3-provider/dapp-chain';
import { capitalize } from 'utils/capitalize';

import { Wrap, TextStyle, ButtonStyle } from './styles';
import { useDappStatus } from 'modules/web3';

export type LidoMultichainFallbackComponent = FC<
  { textEnding: string } & BlockProps
>;

const multichainLogos = {
  [LIDO_MULTICHAIN_CHAINS.Arbitrum]: ArbitrumLogo,
  [LIDO_MULTICHAIN_CHAINS.Base]: BaseLogo,
  [LIDO_MULTICHAIN_CHAINS.Linea]: LineaLogo,
  [LIDO_MULTICHAIN_CHAINS.Mantle]: MantleLogo,
  [LIDO_MULTICHAIN_CHAINS.Optimism]: OptimismLogo,
  [LIDO_MULTICHAIN_CHAINS['Polygon PoS']]: PolygonLogo,
  [LIDO_MULTICHAIN_CHAINS['zkSync Era']]: ZkSyncLogo,
  [LIDO_MULTICHAIN_CHAINS.Scroll]: ScrollLogo,
  [LIDO_MULTICHAIN_CHAINS['BNB Chain']]: BNBLogo,
  [LIDO_MULTICHAIN_CHAINS['Mode Chain']]: ModeLogo,
};

const getChainLogo = (chainId: LIDO_MULTICHAIN_CHAINS) => {
  const SVGLogo = multichainLogos[chainId];
  return SVGLogo ? <SVGLogo style={{ marginBottom: '13px' }} /> : null;
};

export const LidoMultichainFallback: LidoMultichainFallbackComponent = (
  props,
) => {
  const { walletChainId } = useDappStatus();
  const { defaultChain } = useUserConfig();
  const router = useRouter();

  const defaultChainName = useMemo(() => {
    if (CHAINS[defaultChain] === 'Mainnet') return 'Ethereum';
    return CHAINS[defaultChain];
  }, [defaultChain]);

  const lidoMultichainChainName = useMemo(() => {
    // Trick. Anyway, this condition is working only SPA starting.
    return (
      (!!walletChainId && LIDO_MULTICHAIN_CHAINS[walletChainId]) || 'unknown'
    );
  }, [walletChainId]);

  const switchToText = useMemo(() => {
    if (router.pathname === '/wrap/[[...mode]]') {
      return `${capitalize(ETHEREUM)}/${capitalize(OPTIMISM)}`;
    } else {
      return defaultChainName;
    }
  }, [router.pathname, defaultChainName]);

  return (
    <Wrap {...props} chainId={walletChainId as LIDO_MULTICHAIN_CHAINS}>
      {getChainLogo(walletChainId as LIDO_MULTICHAIN_CHAINS)}
      <TextStyle>
        You are currently on {lidoMultichainChainName}.
        <br />
        Explore Lido Multichain or switch to {switchToText} {props.textEnding}.
      </TextStyle>
      <Link href={`${config.rootOrigin}/lido-multichain`}>
        <ButtonStyle
          size={'xs'}
          onClick={() =>
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.lidoOnLidoMultichainOpportunities,
            )
          }
        >
          Lido Multichain
        </ButtonStyle>
      </Link>
    </Wrap>
  );
};
