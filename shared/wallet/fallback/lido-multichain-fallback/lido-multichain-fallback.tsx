import { FC } from 'react';

import { BlockProps, Link } from '@lidofinance/lido-ui';

import ArbitrumLogo from 'assets/icons/lido-multichain/arbitrum.svg?react';
import BaseLogo from 'assets/icons/lido-multichain/base.svg?react';
import LineaLogo from 'assets/icons/lido-multichain/linea.svg?react';
import OptimismLogo from 'assets/icons/lido-multichain/optimism.svg?react';
import BNBLogo from 'assets/icons/lido-multichain/bnb.svg?react';
import UnichainLogo from 'assets/icons/lido-multichain/unichain.svg?react';
import MetisLogo from 'assets/icons/lido-multichain/metis.svg?react';

import { config } from 'config';
import { LIDO_MULTICHAIN_CHAINS } from 'consts/chains';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { Wrap, TextStyle, ButtonStyle } from './styles';
import { useDappStatus } from 'modules/web3';
import { joinWithOr } from 'utils/join-with-or';

export type LidoMultichainFallbackComponent = FC<
  { textEnding: string } & BlockProps
>;

const multichainLogos = {
  [LIDO_MULTICHAIN_CHAINS.Arbitrum]: ArbitrumLogo,
  [LIDO_MULTICHAIN_CHAINS.Base]: BaseLogo,
  [LIDO_MULTICHAIN_CHAINS.Linea]: LineaLogo,
  [LIDO_MULTICHAIN_CHAINS.Optimism]: OptimismLogo,
  [LIDO_MULTICHAIN_CHAINS['BNB Chain']]: BNBLogo,
  [LIDO_MULTICHAIN_CHAINS.Unichain]: UnichainLogo,
  [LIDO_MULTICHAIN_CHAINS.Metis]: MetisLogo,
};

const getChainLogo = (chainId: LIDO_MULTICHAIN_CHAINS) => {
  const SVGLogo = multichainLogos[chainId];
  return SVGLogo ? <SVGLogo style={{ marginBottom: '13px' }} /> : null;
};

export const LidoMultichainFallback: LidoMultichainFallbackComponent = (
  props,
) => {
  const { walletChainId, supportedChainLabels } = useDappStatus();

  // Trick. Anyway, this condition is working only SPA starting.
  const lidoMultichainChainName =
    (!!walletChainId && LIDO_MULTICHAIN_CHAINS[walletChainId]) || 'unknown';

  return (
    <Wrap {...props} chainId={walletChainId as LIDO_MULTICHAIN_CHAINS}>
      {getChainLogo(walletChainId as LIDO_MULTICHAIN_CHAINS)}
      <TextStyle>
        You are currently on {lidoMultichainChainName}.
        <br />
        Explore Lido Multichain or switch to {joinWithOr(
          supportedChainLabels,
        )}{' '}
        {props.textEnding}.
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
