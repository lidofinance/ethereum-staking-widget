export const CHAINS = {
  // Ethereum mainnet + testnets
  Mainnet: 1,
  Hoodi: 560048,
  Sepolia: 11155111,
  // L2 chains w/ wrap
  Optimism: 10, // also /w stake
  OptimismSepolia: 11155420,
  Unichain: 130,
  UnichainSepolia: 1301,
  // L2 chains w/ stake
  Base: 8453,
  Linea: 59144,
  Arbitrum: 42161,
} as const;

export type CHAIN_ID = (typeof CHAINS)[keyof typeof CHAINS];

export const CHAIN_LIST = Object.values(CHAINS) as readonly CHAIN_ID[];

export const KNOWN_CHAIN_IDS = new Set<number>(Object.values(CHAINS));
