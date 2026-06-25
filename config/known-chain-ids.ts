import { CHAINS } from './chains';

export const KNOWN_CHAIN_IDS = new Set<number>(
  Object.values(CHAINS).filter((v): v is number => typeof v === 'number'),
);
