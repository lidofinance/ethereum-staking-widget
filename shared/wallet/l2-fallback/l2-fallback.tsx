import { FC, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { BlockProps, Link } from '@lidofinance/lido-ui';

import { ReactComponent as ArbitrumLogo } from 'assets/icons/l2/arbitrum.svg';
import { ReactComponent as BaseLogo } from 'assets/icons/l2/base.svg';
import { ReactComponent as LineaLogo } from 'assets/icons/l2/linea.svg';
import { ReactComponent as MantleLogo } from 'assets/icons/l2/mantle.svg';
import { ReactComponent as OptimismLogo } from 'assets/icons/l2/optimism.svg';
import { ReactComponent as PolygonLogo } from 'assets/icons/l2/polygon.svg';
import { ReactComponent as ZkSyncLogo } from 'assets/icons/l2/zk-sync.svg';
import { ReactComponent as ScrollLogo } from 'assets/icons/l2/scroll.svg';

import { config } from 'config';
import { useUserConfig } from 'config/user-config';
import { CHAINS, L2_CHAINS } from 'consts/chains';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';

import { L2FallbackWalletStyle, TextStyle, ButtonStyle } from './styles';

export type L2FallbackComponent = FC<{ textEnding: string } & BlockProps>;

const l2Logos = {
  [L2_CHAINS.Arbitrum]: ArbitrumLogo,
  [L2_CHAINS.Base]: BaseLogo,
  [L2_CHAINS.Linea]: LineaLogo,
  [L2_CHAINS.Mantle]: MantleLogo,
  [L2_CHAINS.Optimism]: OptimismLogo,
  [L2_CHAINS.Polygon]: PolygonLogo,
  [L2_CHAINS.zkSync]: ZkSyncLogo,
  [L2_CHAINS.Scroll]: ScrollLogo,
};

const getL2Logo = (chainId: L2_CHAINS) => {
  const SVGLogo = l2Logos[chainId];
  return SVGLogo ? <SVGLogo style={{ marginBottom: '13px' }} /> : null;
};

export const L2Fallback: L2FallbackComponent = (props) => {
  const { chainId } = useAccount();
  const { defaultChain } = useUserConfig();

  const defaultChainName = useMemo(() => {
    return CHAINS[defaultChain];
  }, [defaultChain]);

  const l2ChainName = useMemo(() => {
    // Trick. Anyway, this condition is working only SPA starting.
    return (!!chainId && L2_CHAINS[chainId]) || 'unknown';
  }, [chainId]);

  return (
    <L2FallbackWalletStyle {...props}>
      {getL2Logo(chainId as L2_CHAINS)}
      <TextStyle>
        Learn about Lido on L2 opportunities on {l2ChainName} network or switch
        to Ethereum {defaultChainName} {props.textEnding}
      </TextStyle>
      <Link
        href={`${config.rootOrigin}/lido-on-l2`}
        data-matomo={MATOMO_CLICK_EVENTS_TYPES.lidoOnL2Opportunities}
      >
        <ButtonStyle size={'xs'}>Lido on L2 opportunities</ButtonStyle>
      </Link>
    </L2FallbackWalletStyle>
  );
};
