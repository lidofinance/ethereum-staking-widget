import { CHAINS } from 'consts/chains';
import { TOKENS, TOKEN_SYMBOLS, type Token } from 'consts/tokens';
import { getTokenAddress } from 'config/networks/token-address';
import { bnAmountToNumber } from 'utils/bn';
import { getTokenDecimals } from 'utils/token-decimals';
import type { PortfolioToken } from 'utilsApi/portfolio/types';

// read on-chain when the portfolio API has no answer
export const MAIN_TOKENS = [
  TOKENS.eth,
  TOKENS.weth,
  TOKENS.usdc,
  TOKENS.usdt,
] as const;

export type MainToken = (typeof MAIN_TOKENS)[number];
export type MainTokenBalances = Record<MainToken, bigint>;

const MAIN_TOKEN_NAMES: Record<MainToken, string> = {
  [TOKENS.eth]: 'Ethereum',
  [TOKENS.weth]: 'Wrapped Ether',
  [TOKENS.usdc]: 'USD Coin',
  [TOKENS.usdt]: 'Tether USD',
};

const ETH_PRICED_TOKENS: Token[] = [TOKENS.eth, TOKENS.weth];

// stablecoins count 1:1 to USD, as across the app; no ETH price, no value
const getPriceUsd = (token: MainToken, ethPriceUsd: number | undefined) => {
  if (!ETH_PRICED_TOKENS.includes(token)) return 1;
  return ethPriceUsd ?? null;
};

// held main tokens on Ethereum, in the shape of the API rows
export const buildMainTokens = (
  balances: MainTokenBalances,
  ethPriceUsd: number | undefined,
): PortfolioToken[] =>
  MAIN_TOKENS.filter((token) => balances[token] > 0n).map((token) => {
    const isNative = token === TOKENS.eth;
    const decimals = getTokenDecimals(token);
    const amount = bnAmountToNumber(balances[token], decimals);
    const priceUsd = getPriceUsd(token, ethPriceUsd);
    return {
      id: `onchain-${token}`,
      chainId: CHAINS.Mainnet,
      chainSlug: 'ethereum',
      chainName: 'Ethereum',
      address: isNative
        ? null
        : (getTokenAddress(CHAINS.Mainnet, token)?.toLowerCase() ?? null),
      isNative,
      symbol: TOKEN_SYMBOLS[token],
      name: MAIN_TOKEN_NAMES[token],
      decimals,
      amountRaw: balances[token].toString(),
      amount,
      priceUsd,
      valueUsd: priceUsd === null ? null : amount * priceUsd,
      isLido: false,
    };
  });
