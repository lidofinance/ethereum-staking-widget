import { TOKENS } from 'consts/tokens';
import { WITHDRAWAL_WAITING_TIME_TOOLTIP } from 'modules/mellow-meta-vaults';

import type { UsdWithdrawToken } from '../types';

type UsdWithdrawTokenText = {
  willReceiveHelp: string;
  waitingTime: string;
  waitingTimeTooltip: string;
};

export const USD_WITHDRAW_TOKEN_TEXT: Record<
  UsdWithdrawToken,
  UsdWithdrawTokenText
> = {
  [TOKENS.usdc]: {
    willReceiveHelp:
      'The final claimable USDC may differ slightly, since your request continues earning until processing is complete.',
    waitingTime: 'Instant or up to 72 hours',
    // Shared with EarnETH and the vault page — reused as is, never edited here.
    waitingTimeTooltip: WITHDRAWAL_WAITING_TIME_TOOLTIP,
  },
  [TOKENS.usdt]: {
    willReceiveHelp:
      'The final claimable USDT may differ slightly, since your request continues earning until processing is complete.',
    waitingTime: 'up to 72 hours',
    waitingTimeTooltip:
      'Withdrawals take up to 72 hours to process. Once ready, your funds can be claimed in the Lido UI.',
  },
};

// Used for the requests sections when they list more than one payout token.
export const USD_WITHDRAW_REQUESTS_MIXED_TOKEN_TOOLTIP =
  'The final claimable amount may differ slightly, since your request continues earning until processing is complete.';
