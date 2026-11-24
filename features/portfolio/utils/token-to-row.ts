import { TOKENS, type Token } from 'consts/tokens';
import { getTokenAddress } from 'config/networks/token-address';
import type { PortfolioToken } from 'utilsApi/portfolio/types';

import type { PortfolioRow } from '../types';

const ICON_TOKENS: Token[] = Object.values(TOKENS).filter(
  (token) => token !== TOKENS.unsteth,
);

export const toIconToken = (symbol: string): Token | undefined => {
  const lowerCaseSymbol = symbol.toLowerCase();
  return ICON_TOKENS.find((token) => token === lowerCaseSymbol);
};

// an official icon only for the known contract, so a fake stETH gets none
export const getVerifiedIconToken = ({
  symbol,
  chainId,
  address,
  isNative,
}: Pick<PortfolioToken, 'symbol' | 'chainId' | 'address' | 'isNative'>):
  Token | undefined => {
  const token = toIconToken(symbol);
  if (!token || chainId == null) return undefined;
  // only a real native coin is ETH; a DeFi leg named ETH is not
  if (isNative) return token === TOKENS.eth ? token : undefined;
  if (address === null) return undefined;
  const knownAddress = getTokenAddress(chainId, token)?.toLowerCase();
  return knownAddress === address ? token : undefined;
};

const toBigInt = (rawAmount: string) => {
  if (!rawAmount) return null;
  try {
    return BigInt(rawAmount);
  } catch {
    return null;
  }
};

// Lido tokens on L2s are Lido positions too, the server marks only Ethereum
const L2_LIDO_TOKENS: Token[] = [TOKENS.steth, TOKENS.wsteth];

export const isLidoApiToken = (token: PortfolioToken): boolean => {
  if (token.isLido) return true;
  const iconToken = getVerifiedIconToken(token);
  return !!iconToken && L2_LIDO_TOKENS.includes(iconToken);
};

export const tokenToRow = (token: PortfolioToken): PortfolioRow => {
  const amount = token.decimals == null ? null : toBigInt(token.amountRaw);
  const decimals = token.decimals ?? 18;
  return {
    key: token.id,
    symbol: token.symbol,
    name: token.name,
    iconToken: getVerifiedIconToken(token),
    amount,
    decimals,
    valueUsd: token.valueUsd,
    apr: null,
    rewardsUsd: null,
    rewardsAmount: null,
    rewardsSymbol: null,
    ...(token.activityTypes ? { activityTypes: token.activityTypes } : {}),
    chains: [
      {
        slug: token.chainSlug,
        name: token.chainName,
        address: token.address,
        isNative: token.isNative,
        amount,
        decimals,
        amountFloat: token.amount,
        valueUsd: token.valueUsd,
      },
    ],
  };
};
