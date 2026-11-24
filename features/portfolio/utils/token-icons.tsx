import type { ComponentProps, FC } from 'react';
import {
  TokenDvstEth,
  TokenEarnEth,
  TokenEarnUsd,
  TokenEth,
  TokenGg,
  TokenStrEth,
  TokenStEth,
  TokenUsdc,
  TokenUsde,
  TokenUsdt,
  TokenWEth,
  TokenWstEth,
} from '@lidofinance/lido-app-ui';

import { TOKENS, type Token } from 'consts/tokens';

type TokenGlyph = FC<ComponentProps<'svg'>>;

// the app-ui token set, as the Portfolio design uses it
const TOKEN_ICONS: Partial<Record<Token, TokenGlyph>> = {
  [TOKENS.eth]: TokenEth,
  [TOKENS.weth]: TokenWEth,
  [TOKENS.steth]: TokenStEth,
  [TOKENS.wsteth]: TokenWstEth,
  [TOKENS.usdc]: TokenUsdc,
  [TOKENS.usdt]: TokenUsdt,
  [TOKENS.usde]: TokenUsde,
  [TOKENS.earneth]: TokenEarnEth,
  [TOKENS.earnusd]: TokenEarnUsd,
  [TOKENS.dvsteth]: TokenDvstEth,
  [TOKENS.gg]: TokenGg,
  [TOKENS.streth]: TokenStrEth,
};

export const PortfolioTokenGlyph: FC<{ token: Token }> = ({ token }) => {
  const Glyph = TOKEN_ICONS[token];
  return Glyph ? <Glyph aria-hidden /> : null;
};
