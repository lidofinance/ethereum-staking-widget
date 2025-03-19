import type { Address } from 'viem';
import { LIDO_TOKENS, CHAINS } from '@lidofinance/lido-ethereum-sdk';

export type TOKENS =
  | Exclude<(typeof LIDO_TOKENS)[keyof typeof LIDO_TOKENS], 'unstETH'>
  | 'LDO';

export const TOKENS_BY_NETWORK: {
  [key in CHAINS]?: { [key in TOKENS]?: Address };
} = {
  [CHAINS.Mainnet]: {
    [LIDO_TOKENS.steth]: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    [LIDO_TOKENS.wsteth]: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    LDO: '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
  },
  [CHAINS.Holesky]: {
    [LIDO_TOKENS.steth]: '0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034',
    [LIDO_TOKENS.wsteth]: '0x8d09a4502Cc8Cf1547aD300E066060D043f6982D',
    LDO: '0x14ae7daeecdf57034f3E9db8564e46Dba8D97344',
  },
  [CHAINS.Hoodi]: {
    [LIDO_TOKENS.steth]: '0x3508A952176b3c15387C97BE809eaffB1982176a',
    [LIDO_TOKENS.wsteth]: '0x7E99eE3C66636DE415D2d7C880938F2f40f94De4',
    LDO: '0xEf2573966D009CcEA0Fc74451dee2193564198dc',
  },
  [CHAINS.Sepolia]: {
    [LIDO_TOKENS.steth]: '0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af',
    [LIDO_TOKENS.wsteth]: '0xB82381A3fBD3FaFA77B3a7bE693342618240067b',
    LDO: '0xd06dF83b8ad6D89C86a187fba4Eae918d497BdCB',
  },
};

export const getTokenAddress = (
  chainId: CHAINS,
  token: TOKENS,
): Address | undefined => {
  if (token === 'ETH') return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  return TOKENS_BY_NETWORK?.[chainId]?.[token];
};
