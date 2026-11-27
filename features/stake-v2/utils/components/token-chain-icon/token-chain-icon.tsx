import type { ComponentPropsWithoutRef, FC, SVGProps } from 'react';
import {
  Arbitrum,
  Base,
  Ethereum,
  isTokenIcon,
  Linea,
  Optimism,
  TokenIcon,
  Unichain,
} from '@lidofinance/lido-app-ui';

import { DAPP_CHAIN_TYPE, getChainTypeByChainId } from 'modules/web3';

import { ChainBadge, IconBox } from './styles';

const CHAIN_ICONS: Record<DAPP_CHAIN_TYPE, FC<SVGProps<SVGSVGElement>>> = {
  [DAPP_CHAIN_TYPE.Ethereum]: Ethereum,
  [DAPP_CHAIN_TYPE.Optimism]: Optimism,
  [DAPP_CHAIN_TYPE.Unichain]: Unichain,
  [DAPP_CHAIN_TYPE.Base]: Base,
  [DAPP_CHAIN_TYPE.Arbitrum]: Arbitrum,
  [DAPP_CHAIN_TYPE.Linea]: Linea,
};

type ChainIconProps = SVGProps<SVGSVGElement> & {
  chainId: number;
};

/** Network glyph of `chainId`; nothing for an unknown chain */
export const ChainIcon = ({ chainId, ...props }: ChainIconProps) => {
  const chainType = getChainTypeByChainId(chainId);
  const Icon = chainType ? CHAIN_ICONS[chainType] : null;
  return Icon ? <Icon aria-hidden {...props} /> : null;
};

type TokenChainIconProps = ComponentPropsWithoutRef<'span'> & {
  token: string;
  chainId: number;
  /** px, 32 by default */
  size?: number;
};

/**
 * Token glyph with a 12px network badge in the bottom right corner.
 */
export const TokenChainIcon = ({
  token,
  chainId,
  size = 32,
  ...props
}: TokenChainIconProps) => {
  const hasChainIcon = !!getChainTypeByChainId(chainId);

  return (
    <IconBox aria-hidden $size={size} {...props}>
      {isTokenIcon(token) && <TokenIcon token={token} />}
      {hasChainIcon && (
        <ChainBadge>
          <ChainIcon chainId={chainId} />
        </ChainBadge>
      )}
    </IconBox>
  );
};
