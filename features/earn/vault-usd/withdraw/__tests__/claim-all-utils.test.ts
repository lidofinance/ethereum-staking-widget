import { decodeFunctionData, type Address } from 'viem';
import { describe, expect, it } from 'vitest';

import { ASYNC_REDEEM_QUEUE_ABI } from 'modules/mellow-meta-vaults/abi';
import { getUsdVaultWithdrawClaimCalls } from '../claim-all-utils';

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
