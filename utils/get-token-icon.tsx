import invariant from 'tiny-invariant';
import {
  TokenEthScalableIcon,
  TokenWethScalableIcon,
  TokenWstethScalableIcon,
  TokenStethScalableIcon,
} from 'assets/earn';
import {
  TokenUsdcIcon,
  TokenUsdtIcon,
  TokenStrethIcon,
  TokenDvstethIcon,
  TokenGGIcon,
} from 'assets/earn-v2';
import { TOKENS, type Token, type TokenSymbol } from 'consts/tokens';

// This function is used to get the icon dynamically for a given token,
// e.g. in a deposit for, where a user can select a token and we want to show the corresponding icon.
// Should return scalable icons (without fixed width and height) to be used in different places with different sizes.
// May not cover all supported tokens, only the ones that are used in the Earn Vault txs for now. Can be expanded if needed.
export const getTokenIcon = (t: Token | TokenSymbol) => {
  const token = t.toLowerCase();
  switch (token) {
    case TOKENS.eth:
      return <TokenEthScalableIcon />;
    case TOKENS.weth:
      return <TokenWethScalableIcon />;
    case TOKENS.wsteth:
      return <TokenWstethScalableIcon />;
    case TOKENS.steth:
      return <TokenStethScalableIcon />;
    case TOKENS.usdt:
      return <TokenUsdtIcon />;
    case TOKENS.usdc:
      return <TokenUsdcIcon />;
    case TOKENS.gg:
      return <TokenGGIcon />;
    case TOKENS.dvsteth:
      return <TokenDvstethIcon />;
    case TOKENS.streth:
      return <TokenStrethIcon />;
    default:
      invariant(false, `Unsupported token: ${t}`);
  }
};
