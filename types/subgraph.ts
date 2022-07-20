import { CHAINS } from 'utilsApi/chains';

export type SubgraphChains = Extract<CHAINS, CHAINS.Mainnet | CHAINS.Goerli>;
