import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('viem/actions', () => ({
  getFeeHistory: vi.fn(),
  estimateMaxPriorityFeePerGas: vi.fn(),
}));

import { estimateMaxPriorityFeePerGas, getFeeHistory } from 'viem/actions';
import { CHAINS } from 'config/chains';
import { estimateMaxFee } from '../estimate';
import { getFeeHistoryMaxFee } from '../models/fee-history';
import { CHAIN_FEE_PARAMS, DEFAULT_FEE_PARAMS } from '../params';
import type { FeeClient } from '../types';

const client = {} as FeeClient;
const feeHistory = { baseFeePerGas: [100n, 110n], reward: [[3n], [5n]] };

describe('getFeeHistoryMaxFee', () => {
  beforeEach(() => {
    vi.mocked(getFeeHistory)
      .mockReset()
      .mockResolvedValue(feeHistory as never);
    vi.mocked(estimateMaxPriorityFeePerGas).mockReset().mockResolvedValue(0n);
  });

  it('samples the pending fee history with the params and floors the tip', async () => {
    vi.mocked(estimateMaxPriorityFeePerGas).mockResolvedValue(50n);
    await expect(
      getFeeHistoryMaxFee(client, {
        ...DEFAULT_FEE_PARAMS,
        feeHistoryBlockCount: 7,
        feeHistoryRewardPercentile: 40,
      }),
    ).resolves.toEqual({
      lastBaseFeePerGas: 100n,
      maxPriorityFeePerGas: 50n,
      maxFeePerGas: 250n,
    });
    expect(getFeeHistory).toHaveBeenCalledWith(client, {
      blockCount: 7,
      blockTag: 'pending',
      rewardPercentiles: [40],
    });
  });

  it('keeps the sampled tip when the suggestion is lower', async () => {
    vi.mocked(estimateMaxPriorityFeePerGas).mockResolvedValue(1n);
    await expect(
      getFeeHistoryMaxFee(client, DEFAULT_FEE_PARAMS),
    ).resolves.toMatchObject({ maxPriorityFeePerGas: 4n, maxFeePerGas: 204n });
  });

  it('does not block the quote when the suggestion fails', async () => {
    vi.mocked(estimateMaxPriorityFeePerGas).mockRejectedValue(
      new Error('method not supported'),
    );
    await expect(
      getFeeHistoryMaxFee(client, DEFAULT_FEE_PARAMS),
    ).resolves.toMatchObject({ maxPriorityFeePerGas: 4n, maxFeePerGas: 204n });
  });
});

describe('estimateMaxFee', () => {
  beforeEach(() => {
    vi.mocked(getFeeHistory)
      .mockReset()
      .mockResolvedValue(feeHistory as never);
    vi.mocked(estimateMaxPriorityFeePerGas).mockReset().mockResolvedValue(0n);
  });

  it.each([CHAINS.Mainnet, CHAINS.Optimism, CHAINS.Arbitrum, CHAINS.Linea])(
    'prices chain %s from the fee history with the default params',
    async (chainId) => {
      await expect(estimateMaxFee(client, chainId)).resolves.toEqual({
        lastBaseFeePerGas: 100n,
        maxPriorityFeePerGas: 4n,
        maxFeePerGas: 204n,
      });
      expect(getFeeHistory).toHaveBeenCalledWith(
        client,
        expect.objectContaining({
          blockCount: DEFAULT_FEE_PARAMS.feeHistoryBlockCount,
          rewardPercentiles: [DEFAULT_FEE_PARAMS.feeHistoryRewardPercentile],
        }),
      );
    },
  );

  it('applies a per-chain params override', async () => {
    CHAIN_FEE_PARAMS[CHAINS.Base] = {
      baseFeeMultiplier: 3n,
      feeHistoryBlockCount: 2,
    };
    try {
      await expect(estimateMaxFee(client, CHAINS.Base)).resolves.toMatchObject({
        maxFeePerGas: 304n,
      });
      expect(getFeeHistory).toHaveBeenCalledWith(
        client,
        expect.objectContaining({ blockCount: 2 }),
      );
    } finally {
      delete CHAIN_FEE_PARAMS[CHAINS.Base];
    }
  });
});
