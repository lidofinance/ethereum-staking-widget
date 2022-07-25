import { CHAINS } from 'utils/chains';

export type SubgraphChains = Extract<CHAINS, CHAINS.Mainnet | CHAINS.Goerli>;
