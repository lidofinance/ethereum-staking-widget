import { claimLog, account } from './claim-fixtures';
import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeEventTopics,
  type Address,
  type Hex,
} from 'viem';
import { describe, expect, it } from 'vitest';

import { ASYNC_REDEEM_QUEUE_ABI } from 'modules/mellow-meta-vaults/abi';
import {
  hasClaimEvents,
  getUsdVaultWithdrawClaimCalls,
  type ClaimReceipt,
} from '../claim-all-utils';

const receiver = '0x0000000000000000000000000000000000000001';
const usdcQueue = '0x0000000000000000000000000000000000000002';
const usdtQueue = '0x0000000000000000000000000000000000000003';

const operation = (address: Address, timestamps: number[]) => ({
  redeemQueue: { address, abi: ASYNC_REDEEM_QUEUE_ABI },
  timestamps,
});

describe('getUsdVaultWithdrawClaimCalls', () => {
  it('builds one batch containing the USDC and USDT queue claims', () => {
    const calls = getUsdVaultWithdrawClaimCalls(receiver, [
      operation(usdcQueue, [11, 12]),
      operation(usdtQueue, [21]),
    ]);

    expect(calls.map(({ to }) => to)).toEqual([usdcQueue, usdtQueue]);
    expect(
      calls.map(({ data }) => {
        if (!data) throw new Error('Claim call data is missing');
        return decodeFunctionData({ abi: ASYNC_REDEEM_QUEUE_ABI, data });
      }),
    ).toEqual([
      {
        functionName: 'claim',
        args: [receiver, [11, 12]],
      },
      {
        functionName: 'claim',
        args: [receiver, [21]],
      },
    ]);
  });

  it('builds a single-call batch when only one queue has claims', () => {
    const calls = getUsdVaultWithdrawClaimCalls(receiver, [
      operation(usdtQueue, [21]),
    ]);

    expect(calls).toHaveLength(1);
    expect(calls[0]?.to).toBe(usdtQueue);
  });
});

describe('claim receipt matching', () => {
  it('requires every requested timestamp in the correct queue', () => {
    expect(
      hasClaimEvents(
        [claimLog(usdcQueue, 11), claimLog(usdcQueue, 12)],
        usdcQueue,
        account,
        [11, 12],
      ),
    ).toBe(true);
    expect(
      hasClaimEvents([claimLog(usdcQueue, 11)], usdcQueue, account, [11, 12]),
    ).toBe(false);
    expect(
      hasClaimEvents([claimLog(usdtQueue, 11)], usdcQueue, account, [11]),
    ).toBe(false);
  });
  it('rejects another account and successful cancellation receipts without events', () => {
    expect(hasClaimEvents([claimLog()], usdcQueue, usdtQueue, [1])).toBe(false);
    expect(hasClaimEvents([], usdcQueue, account, [1])).toBe(false);
  });
  it('ignores unrelated or malformed logs', () => {
    expect(
      hasClaimEvents(
        [{ ...claimLog(), data: '0x' }, claimLog()],
        usdcQueue,
        account,
        [1],
      ),
    ).toBe(true);
  });
  // Only RedeemRequestClaimed proves a payout. Every other event this queue
  // emits must be skipped, even when its account and timestamp line up.
  it('ignores other events emitted by the same queue', () => {
    const redeemRequested: ClaimReceipt['logs'][number] = {
      address: usdcQueue,
      topics: encodeEventTopics({
        abi: ASYNC_REDEEM_QUEUE_ABI,
        eventName: 'RedeemRequested',
        args: { account },
      }) as Hex[],
      data: encodeAbiParameters(
        [{ type: 'uint256' }, { type: 'uint256' }],
        [10n, 1n],
      ),
    };

    expect(hasClaimEvents([redeemRequested], usdcQueue, account, [1])).toBe(
      false,
    );
  });
});
