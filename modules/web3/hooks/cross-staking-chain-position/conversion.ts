import { TOKENS } from 'consts/tokens';

export const POSITION_TOKENS = [
  TOKENS.eth,
  TOKENS.weth,
  TOKENS.steth,
  TOKENS.wsteth,
] as const;

export type PositionToken = (typeof POSITION_TOKENS)[number];

// every position token, on every chain, has 18 decimals
export const POSITION_TOKEN_DECIMALS = 18;

const ONE = 10n ** 18n;

export type ConversionRates = {
  // stETH per 1 wstETH (18 decimals), read once on config.defaultChain
  // and applied to every chain
  stethPerWsteth?: bigint;
};

type ConversionHop = {
  to: PositionToken;
  // `chainId` is unused for now: it is here so a hop can switch to a
  // per-chain rate or a separate oracle without touching callers
  convert: (
    amount: bigint,
    rates: ConversionRates,
    chainId: number,
  ) => bigint | undefined;
};

/**
 * One hop per token towards ETH, e.g. wstETH -> stETH -> ETH.
 * ETH is the end of every path; ETH -> USD happens on the total.
 */
const TO_ETH_PATH: Record<Exclude<PositionToken, 'eth'>, ConversionHop> = {
  [TOKENS.weth]: { to: TOKENS.eth, convert: (amount) => amount },
  // stETH is treated as 1:1 with ETH
  [TOKENS.steth]: { to: TOKENS.eth, convert: (amount) => amount },
  [TOKENS.wsteth]: {
    to: TOKENS.steth,
    convert: (amount, { stethPerWsteth }) =>
      stethPerWsteth === undefined
        ? undefined
        : (amount * stethPerWsteth) / ONE,
  },
};

/**
 * `undefined` when any hop on the path is missing its rate.
 * Zero is zero on every path, so it never waits on a rate.
 */
export const convertToEth = (
  token: PositionToken,
  amount: bigint,
  rates: ConversionRates,
  chainId: number,
): bigint | undefined => {
  if (amount === 0n) return 0n;
  let current = token;
  let value: bigint | undefined = amount;
  // bounded by the token count so a misconfigured cycle cannot hang
  for (let hops = 0; hops < POSITION_TOKENS.length; hops++) {
    if (current === TOKENS.eth || value === undefined) return value;
    const hop: ConversionHop = TO_ETH_PATH[current];
    value = hop.convert(value, rates, chainId);
    current = hop.to;
  }
  return current === TOKENS.eth ? value : undefined;
};
