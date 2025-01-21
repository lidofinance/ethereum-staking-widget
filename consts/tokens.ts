import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk';

export type LIDO_TOKENS_KEYS = keyof typeof LIDO_TOKENS;
export type LIDO_TOKENS_VALUES = (typeof LIDO_TOKENS)[keyof typeof LIDO_TOKENS];
