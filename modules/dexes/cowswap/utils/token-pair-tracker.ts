type TokenRef = { address?: string; symbol?: string } | undefined;

type OrderRef = { uid: string; sellToken: string; buyToken: string };

// "{sell}-{buy}" symbols for the Matomo token dimension, e.g. "ETH-stETH"
export const getTokenPair = (sell: TokenRef, buy: TokenRef) =>
  sell?.symbol && buy?.symbol ? `${sell.symbol}-${buy.symbol}` : undefined;

// order lifecycle events carry token addresses only: pairs are kept by order uid,
// symbols by address from every event that has them
export const createTokenPairTracker = () => {
  const symbols = new Map<string, string>();
  const orderPairs = new Map<string, string>();

  const remember = (token: TokenRef) => {
    if (token?.address && token.symbol)
      symbols.set(token.address.toLowerCase(), token.symbol);
  };

  const pair = (sell: TokenRef, buy: TokenRef) => {
    remember(sell);
    remember(buy);
    return getTokenPair(sell, buy);
  };

  const postedOrder = (uid: string, sell: TokenRef, buy: TokenRef) => {
    const tokenPair = pair(sell, buy);
    if (tokenPair) orderPairs.set(uid, tokenPair);
    return tokenPair;
  };

  const order = ({ uid, sellToken, buyToken }: OrderRef) =>
    orderPairs.get(uid) ??
    getTokenPair(
      { symbol: symbols.get(sellToken.toLowerCase()) },
      { symbol: symbols.get(buyToken.toLowerCase()) },
    );

  return { pair, postedOrder, order };
};
