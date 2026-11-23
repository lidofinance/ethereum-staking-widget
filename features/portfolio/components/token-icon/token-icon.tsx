import type { FC } from 'react';

import { getAllocationChainIcon } from 'features/earn/shared/vault-allocation/protocol-icon/chain-icon-library';

import type { PortfolioRow } from '../../types';
import { PortfolioTokenGlyph } from '../../utils';
import { ChainBadge, IconBox, LetterAvatar } from './styles';

type TokenIconProps = Pick<PortfolioRow, 'symbol' | 'iconToken'> & {
  chains?: PortfolioRow['chains'];
  size?: number;
};

export const TokenIcon: FC<TokenIconProps> = ({
  symbol,
  iconToken,
  chains = [],
  size = 32,
}) => {
  const [firstChain] = chains;
  const ChainIcon = firstChain ? getAllocationChainIcon(firstChain.slug) : null;

  return (
    <IconBox $size={size}>
      {iconToken ? (
        <PortfolioTokenGlyph token={iconToken} />
      ) : (
        <LetterAvatar aria-hidden data-testid="portfolioLetterAvatar">
          {symbol.slice(0, 1)}
        </LetterAvatar>
      )}
      {chains.length > 1 && (
        <ChainBadge aria-label={`${chains.length} networks`}>
          {chains.length}
        </ChainBadge>
      )}
      {chains.length === 1 && ChainIcon && (
        <ChainBadge title={firstChain.name}>
          <ChainIcon aria-hidden />
        </ChainBadge>
      )}
    </IconBox>
  );
};
