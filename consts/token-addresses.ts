import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk';

// At the moment, we have doubts about using the code in the widget:
// the code```
//  const stethAddress = await lidoSDK.core.getContractAddress(
//    LIDO_CONTRACT_NAMES.lido,
//  );
// ```
//
// At the moment it is only used in:
// - features/withdrawals/request/withdrawal-rates/integrations.ts
// - utils/get-bebop-rate.ts
// - utils/get-open-ocean-rate.ts
//

export type TOKENS =
  | Exclude<(typeof LIDO_TOKENS)[keyof typeof LIDO_TOKENS], 'unstETH'>
  | 'LDO';

export const TOKEN_ADDRESSES: Record<TOKENS, string> = {
  stETH: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
  wstETH: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
  ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  LDO: '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
};

export const getRateTokenAddress = (token: TOKENS): string => {
  return TOKEN_ADDRESSES[token] || '';
};
