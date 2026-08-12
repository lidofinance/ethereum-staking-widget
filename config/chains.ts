export const CHAINS = {
  Mainnet: 1,
  Holesky: 17000,
  Hoodi: 560048,
  Sepolia: 11155111,
  Optimism: 10,
  OptimismSepolia: 11155420,
  Unichain: 130,
  UnichainSepolia: 1301,
} as const;

export type CHAIN_ID = (typeof CHAINS)[keyof typeof CHAINS];

export const CHAIN_LIST = Object.values(CHAINS) as readonly CHAIN_ID[];

export const KNOWN_CHAIN_IDS = new Set<number>(Object.values(CHAINS));
