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

type TokenChainIconProps = ComponentPropsWithoutRef<'span'> & {
  token: string;
  chainId: number;
};

/**
 * Token glyph with a network badge in the bottom right corner.
 * 32px by default; size it with width/height on the root, the badge scales.
 */
export const TokenChainIcon = ({
  token,
  chainId,
  ...props
}: TokenChainIconProps) => {
  const chainType = getChainTypeByChainId(chainId);
  const ChainIcon = chainType ? CHAIN_ICONS[chainType] : null;

  return (
    <IconBox aria-hidden {...props}>
      {isTokenIcon(token) && <TokenIcon token={token} />}
      {ChainIcon && (
        <ChainBadge>
          <ChainIcon />
        </ChainBadge>
      )}
    </IconBox>
  );
};
