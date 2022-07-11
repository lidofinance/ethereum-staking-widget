import { ChainID } from './chainId';

export type Providers = Record<ChainID, [string, ...string[]]>;
