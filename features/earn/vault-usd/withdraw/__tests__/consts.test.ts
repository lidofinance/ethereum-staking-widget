import { describe, expect, it } from 'vitest';

import { TOKENS } from 'consts/tokens';
import { WITHDRAWAL_WAITING_TIME_TOOLTIP } from 'modules/mellow-meta-vaults';
import {
  USD_ASYNC_REDEEM_QUEUE_CONTRACT_NAMES,
  USD_SYNC_REDEEM_QUEUE_CONTRACT_NAMES,
} from '../../contracts';
import { USD_WITHDRAW_TOKEN_TEXT } from '../consts';

describe('USD_WITHDRAW_TOKEN_TEXT', () => {
  it('names the payout token in the "You will receive" tooltip', () => {
    expect(USD_WITHDRAW_TOKEN_TEXT[TOKENS.usdc].willReceiveHelp).toBe(
      'The final claimable USDC may differ slightly, since your request continues earning until processing is complete.',
    );
    expect(USD_WITHDRAW_TOKEN_TEXT[TOKENS.usdt].willReceiveHelp).toBe(
      'The final claimable USDT may differ slightly, since your request continues earning until processing is complete.',
    );
  });

  it('keeps the instant wording for USDC and reuses the shared tooltip', () => {
    expect(USD_WITHDRAW_TOKEN_TEXT[TOKENS.usdc].waitingTime).toBe(
      'Instant or up to 72 hours',
    );
    // Guards the constant that EarnETH and the vault page also render.
    expect(USD_WITHDRAW_TOKEN_TEXT[TOKENS.usdc].waitingTimeTooltip).toBe(
      WITHDRAWAL_WAITING_TIME_TOOLTIP,
    );
  });

  it('never promises an instant withdrawal for USDT', () => {
    const { waitingTime, waitingTimeTooltip, willReceiveHelp } =
      USD_WITHDRAW_TOKEN_TEXT[TOKENS.usdt];

    expect(waitingTime).toBe('up to 72 hours');
    expect(waitingTimeTooltip).toBe(
      'Withdrawals take up to 72 hours to process. Once ready, your funds can be claimed in the Lido UI.',
    );

    for (const text of [waitingTime, waitingTimeTooltip, willReceiveHelp]) {
      expect(text.toLowerCase()).not.toContain('instant');
    }
  });
});

describe('redeem queue contract names', () => {
  it('has an async queue for every payout token', () => {
    expect(USD_ASYNC_REDEEM_QUEUE_CONTRACT_NAMES).toEqual({
      [TOKENS.usdc]: 'usdRedeemQueueUSDC',
      [TOKENS.usdt]: 'usdRedeemQueueUSDT',
    });
  });

  it('has no sync (instant) queue for USDT', () => {
    // This is what makes the instant route unreachable for USDT.
    expect(USD_SYNC_REDEEM_QUEUE_CONTRACT_NAMES[TOKENS.usdt]).toBeUndefined();
    expect(USD_SYNC_REDEEM_QUEUE_CONTRACT_NAMES[TOKENS.usdc]).toBe(
      'usdSyncRedeemQueueUSDC',
    );
  });
});
