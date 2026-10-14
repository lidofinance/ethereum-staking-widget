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
const sampled = {
  lastBaseFeePerGas: 100n,
  maxPriorityFeePerGas: 4n,
  maxFeePerGas: 204n,
};
// OP-stack quotes 1.5x the base fee instead of 2x
const opStackSampled = { ...sampled, maxFeePerGas: 154n };

beforeEach(() => {
  vi.mocked(getFeeHistory)
    .mockReset()
    .mockResolvedValue(feeHistory as never);
  vi.mocked(estimateMaxPriorityFeePerGas).mockReset().mockResolvedValue(50n);
});

describe('getFeeHistoryMaxFee', () => {
  it('samples the pending fee history with the params', async () => {
    await expect(
      getFeeHistoryMaxFee(client, {
        ...DEFAULT_FEE_PARAMS,
        feeHistoryBlockCount: 7,
        feeHistoryRewardPercentile: 40,
      }),
    ).resolves.toEqual(sampled);
    expect(getFeeHistory).toHaveBeenCalledWith(client, {
      blockCount: 7,
      blockTag: 'pending',
      rewardPercentiles: [40],
    });
    expect(estimateMaxPriorityFeePerGas).not.toHaveBeenCalled();
  });
});

describe('estimateMaxFee', () => {
  it.each([CHAINS.Mainnet, CHAINS.Arbitrum, CHAINS.Linea])(
    'prices an SDK-priced tx on chain %s from the fee history alone',
    async (chainId) => {
      await expect(estimateMaxFee(client, chainId)).resolves.toEqual(sampled);
      expect(estimateMaxPriorityFeePerGas).not.toHaveBeenCalled();
    },
  );

  it('op-stack: prices an SDK-priced tx from the fee history with its own headroom', async () => {
    await expect(estimateMaxFee(client, CHAINS.Optimism)).resolves.toEqual(
      opStackSampled,
    );
    expect(estimateMaxPriorityFeePerGas).not.toHaveBeenCalled();
  });

  it.each([CHAINS.Mainnet, CHAINS.Arbitrum, CHAINS.Linea])(
    'ignores the node suggestion on chain %s even for a wallet-priced tx',
    async (chainId) => {
      await expect(
        estimateMaxFee(client, chainId, { isWalletPriced: true }),
      ).resolves.toEqual(sampled);
      expect(estimateMaxPriorityFeePerGas).not.toHaveBeenCalled();
    },
  );

  it('op-stack: floors the tip at the node suggestion for a wallet-priced tx', async () => {
    await expect(
      estimateMaxFee(client, CHAINS.Optimism, { isWalletPriced: true }),
    ).resolves.toEqual({
      lastBaseFeePerGas: 100n,
      maxPriorityFeePerGas: 50n,
      maxFeePerGas: 200n,
    });
    expect(estimateMaxPriorityFeePerGas).toHaveBeenCalledWith(client);
  });

  it('op-stack: keeps the sampled tip when the suggestion is lower', async () => {
    vi.mocked(estimateMaxPriorityFeePerGas).mockResolvedValue(1n);
    await expect(
      estimateMaxFee(client, CHAINS.Base, { isWalletPriced: true }),
    ).resolves.toEqual(opStackSampled);
  });

  it('op-stack: does not block the quote when the suggestion fails', async () => {
    vi.mocked(estimateMaxPriorityFeePerGas).mockRejectedValue(
      new Error('method not supported'),
    );
    await expect(
      estimateMaxFee(client, CHAINS.Base, { isWalletPriced: true }),
    ).resolves.toEqual(opStackSampled);
  });

  it('applies a per-chain params override', async () => {
    CHAIN_FEE_PARAMS[CHAINS.Base] = {
      baseFeeBufferPercent: 200n,
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
