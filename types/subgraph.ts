import { CHAINS } from '@lido-sdk/constants';

export type SubgraphChains = Extract<
  CHAINS,
  | CHAINS.Mainnet
  | CHAINS.Ropsten
  | CHAINS.Rinkeby
  | CHAINS.Goerli
  | CHAINS.Kovan
  | CHAINS.Kintsugi
>;
