import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address, Hex } from 'viem';

vi.mock('viem/op-stack', () => ({ estimateL1Fee: vi.fn() }));

import { estimateL1Fee } from 'viem/op-stack';
import { CHAINS } from 'config/chains';
import { GAS_FEE_MODEL, getGasFeeModel } from '../../consts/gas-fee-model';
import {
  estimateTxFees,
  feeHistoryToMaxFee,
  getLineaTxFees,
  isTxSpecificFeeModel,
  type FeeClient,
} from '../tx-fees';

const tx = {
  account: '0x1111111111111111111111111111111111111111' as Address,
  to: '0x2222222222222222222222222222222222222222' as Address,
  data: '0xabcdef' as Hex,
  value: 1000n,
};

const lineaClient = (result: Record<string, Hex>, fail = false) => {
  const request = vi.fn(async () => {
    if (fail) throw new Error('method not found');
    return result;
  });
  return { client: { request } as unknown as FeeClient, request };
};

describe('getGasFeeModel', () => {
  it('maps chains to fee models and defaults to ethereum', () => {
    expect(getGasFeeModel(CHAINS.Mainnet)).toBe(GAS_FEE_MODEL.Ethereum);
    expect(getGasFeeModel(CHAINS.Hoodi)).toBe(GAS_FEE_MODEL.Ethereum);
    expect(getGasFeeModel(CHAINS.Optimism)).toBe(GAS_FEE_MODEL.OpStack);
    expect(getGasFeeModel(CHAINS.Base)).toBe(GAS_FEE_MODEL.OpStack);
    expect(getGasFeeModel(CHAINS.Unichain)).toBe(GAS_FEE_MODEL.OpStack);
    expect(getGasFeeModel(CHAINS.Arbitrum)).toBe(GAS_FEE_MODEL.Arbitrum);
    expect(getGasFeeModel(CHAINS.Linea)).toBe(GAS_FEE_MODEL.Linea);
    expect(getGasFeeModel(undefined)).toBe(GAS_FEE_MODEL.Ethereum);
    expect(getGasFeeModel(999999)).toBe(GAS_FEE_MODEL.Ethereum);
  });

  it('flags chains that price txs individually', () => {
    expect(isTxSpecificFeeModel(CHAINS.Linea)).toBe(true);
    expect(isTxSpecificFeeModel(CHAINS.Base)).toBe(true);
    expect(isTxSpecificFeeModel(CHAINS.Arbitrum)).toBe(false);
    expect(isTxSpecificFeeModel(CHAINS.Mainnet)).toBe(false);
  });
});

describe('feeHistoryToMaxFee', () => {
  it('doubles the pending base fee and adds the average sampled tip', () => {
    const fees = feeHistoryToMaxFee({
      baseFeePerGas: [10n, 11n],
      reward: [[1n], [3n]],
    });
    expect(fees).toEqual({
      lastBaseFeePerGas: 10n,
      maxPriorityFeePerGas: 2n,
      maxFeePerGas: 22n,
    });
  });

  it('treats a missing reward as a zero tip', () => {
    expect(
      feeHistoryToMaxFee({ baseFeePerGas: [10n], reward: undefined }),
    ).toEqual({
      lastBaseFeePerGas: 10n,
      maxPriorityFeePerGas: 0n,
      maxFeePerGas: 20n,
    });
  });
});

describe('getLineaTxFees', () => {
  it('calls linea_estimateGas with the tx and parses the quote', async () => {
    const { client, request } = lineaClient({
      gasLimit: '0x30000',
      baseFeePerGas: '0x7',
      priorityFeePerGas: '0x100',
    });
    await expect(getLineaTxFees(client, tx)).resolves.toEqual({
      lastBaseFeePerGas: 7n,
      maxPriorityFeePerGas: 256n,
      maxFeePerGas: 14n + 256n,
      gasLimit: 0x30000n,
    });
    expect(request).toHaveBeenCalledWith({
      method: 'linea_estimateGas',
      params: [{ from: tx.account, to: tx.to, data: tx.data, value: '0x3e8' }],
    });
  });
});

describe('estimateTxFees', () => {
  beforeEach(() => {
    vi.mocked(estimateL1Fee).mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('linea: re-prices from linea_estimateGas with a buffered tip', async () => {
    const { client } = lineaClient({
      gasLimit: '0x30000',
      baseFeePerGas: '0x7',
      priorityFeePerGas: '0x64', // 100
    });
    await expect(estimateTxFees(client, CHAINS.Linea, tx)).resolves.toEqual({
      maxPriorityFeePerGas: 125n,
      maxFeePerGas: 14n + 125n,
      gasLimit: 0x30000n,
      l1Fee: 0n,
    });
  });

  it('linea: falls back to no additions when the quote fails', async () => {
    const { client } = lineaClient({}, true);
    await expect(estimateTxFees(client, CHAINS.Linea, tx)).resolves.toEqual({
      l1Fee: 0n,
    });
  });

  it('op-stack: adds the buffered L1 data fee', async () => {
    vi.mocked(estimateL1Fee).mockResolvedValue(1000n);
    const client = {} as FeeClient;
    await expect(estimateTxFees(client, CHAINS.Base, tx)).resolves.toEqual({
      l1Fee: 1250n,
    });
    expect(estimateL1Fee).toHaveBeenCalledWith(
      client,
      expect.objectContaining({
        account: tx.account,
        to: tx.to,
        data: tx.data,
      }),
    );
  });

  it('op-stack: falls back to no L1 fee when the oracle call fails', async () => {
    vi.mocked(estimateL1Fee).mockRejectedValue(new Error('oracle down'));
    await expect(
      estimateTxFees({} as FeeClient, CHAINS.Optimism, tx),
    ).resolves.toEqual({ l1Fee: 0n });
  });

  it('ethereum and arbitrum: no tx-specific additions and no RPC call', async () => {
    const { client, request } = lineaClient({});
    await expect(estimateTxFees(client, CHAINS.Mainnet, tx)).resolves.toEqual({
      l1Fee: 0n,
    });
    await expect(estimateTxFees(client, CHAINS.Arbitrum, tx)).resolves.toEqual({
      l1Fee: 0n,
    });
    expect(request).not.toHaveBeenCalled();
    expect(estimateL1Fee).not.toHaveBeenCalled();
  });
});
