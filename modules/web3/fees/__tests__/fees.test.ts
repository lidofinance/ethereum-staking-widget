import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address, Hex } from 'viem';

vi.mock('viem/op-stack', () => ({ estimateL1Fee: vi.fn() }));

import { estimateL1Fee } from 'viem/op-stack';
import { CHAINS } from 'config/chains';
import {
  estimateSendFees,
  estimateTxFees,
  hasTxSpecificFees,
} from '../estimate';
import { GAS_FEE_MODEL, getGasFeeModel } from '../model';
import {
  feeHistoryToMaxFee,
  withPriorityFeeFloor,
} from '../models/fee-history';
import { getLineaQuote } from '../models/linea';
import {
  CHAIN_FEE_PARAMS,
  DEFAULT_FEE_PARAMS,
  MODEL_FEE_PARAMS,
  getFeeParams,
} from '../params';
import type { FeeClient } from '../types';

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
    expect(hasTxSpecificFees(CHAINS.Linea)).toBe(true);
    expect(hasTxSpecificFees(CHAINS.Base)).toBe(true);
    expect(hasTxSpecificFees(CHAINS.Arbitrum)).toBe(false);
    expect(hasTxSpecificFees(CHAINS.Mainnet)).toBe(false);
  });
});

describe('getFeeParams', () => {
  it('layers chain overrides over model overrides over the defaults', () => {
    const opStackParams = MODEL_FEE_PARAMS[GAS_FEE_MODEL.OpStack];
    MODEL_FEE_PARAMS[GAS_FEE_MODEL.OpStack] = { l1CostBufferPercent: 50n };
    CHAIN_FEE_PARAMS[CHAINS.Optimism] = { baseFeeBufferPercent: 200n };
    try {
      expect(getFeeParams(CHAINS.Mainnet)).toEqual(DEFAULT_FEE_PARAMS);
      expect(getFeeParams(CHAINS.Base)).toEqual({
        ...DEFAULT_FEE_PARAMS,
        l1CostBufferPercent: 50n,
      });
      expect(getFeeParams(CHAINS.Optimism)).toEqual({
        ...DEFAULT_FEE_PARAMS,
        l1CostBufferPercent: 50n,
        baseFeeBufferPercent: 200n,
      });
    } finally {
      MODEL_FEE_PARAMS[GAS_FEE_MODEL.OpStack] = opStackParams;
      delete CHAIN_FEE_PARAMS[CHAINS.Optimism];
    }
  });

  it('gives OP-stack chains less base fee headroom than Ethereum', () => {
    expect(getFeeParams(CHAINS.Mainnet).baseFeeBufferPercent).toBe(100n);
    expect(getFeeParams(CHAINS.Optimism).baseFeeBufferPercent).toBe(50n);
    expect(getFeeParams(CHAINS.Base).baseFeeBufferPercent).toBe(50n);
  });
});

describe('feeHistoryToMaxFee', () => {
  const params = DEFAULT_FEE_PARAMS;

  it('multiplies the pending base fee and adds the average sampled tip', () => {
    expect(
      feeHistoryToMaxFee(
        { baseFeePerGas: [10n, 11n], reward: [[1n], [3n]] },
        params,
      ),
    ).toEqual({
      lastBaseFeePerGas: 10n,
      maxPriorityFeePerGas: 2n,
      maxFeePerGas: 22n,
    });
  });

  it('applies the base fee headroom from the params', () => {
    expect(
      feeHistoryToMaxFee(
        { baseFeePerGas: [10n], reward: [[1n]] },
        { ...params, baseFeeBufferPercent: 200n },
      ).maxFeePerGas,
    ).toBe(31n);
    expect(
      feeHistoryToMaxFee(
        { baseFeePerGas: [100n], reward: [[1n]] },
        { ...params, baseFeeBufferPercent: 50n },
      ).maxFeePerGas,
    ).toBe(151n);
  });

  it('treats a missing reward as a zero tip', () => {
    expect(
      feeHistoryToMaxFee({ baseFeePerGas: [10n], reward: undefined }, params),
    ).toEqual({
      lastBaseFeePerGas: 10n,
      maxPriorityFeePerGas: 0n,
      maxFeePerGas: 20n,
    });
  });

  it('fails on an empty base fee window instead of pricing it at zero', () => {
    expect(() =>
      feeHistoryToMaxFee(
        { baseFeePerGas: [], reward: [[3n]] },
        DEFAULT_FEE_PARAMS,
      ),
    ).toThrow('eth_feeHistory returned no base fee');
  });
});

describe('withPriorityFeeFloor', () => {
  const params = DEFAULT_FEE_PARAMS;
  const sampled = {
    lastBaseFeePerGas: 10_000n,
    maxPriorityFeePerGas: 16n,
    maxFeePerGas: 20_016n,
  };

  it('raises a low sampled tip to the floor and re-derives the max fee', () => {
    // Optimism-like: base fee near zero, sampled tip near zero, node suggests 0.001 gwei
    expect(withPriorityFeeFloor(sampled, 1_000_000n, params)).toEqual({
      lastBaseFeePerGas: 10_000n,
      maxPriorityFeePerGas: 1_000_000n,
      maxFeePerGas: 20_000n + 1_000_000n,
    });
  });

  it('never lowers a higher sampled tip', () => {
    expect(withPriorityFeeFloor(sampled, 2n, params)).toBe(sampled);
  });
});

describe('getLineaQuote', () => {
  it('calls linea_estimateGas with the tx and parses the quote', async () => {
    const { client, request } = lineaClient({
      gasLimit: '0x30000',
      baseFeePerGas: '0x7',
      priorityFeePerGas: '0x100',
    });
    await expect(
      getLineaQuote(client, tx, DEFAULT_FEE_PARAMS),
    ).resolves.toEqual({
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

  it('linea: re-prices from the quote with a buffered tip', async () => {
    const { client } = lineaClient({
      gasLimit: '0x30000',
      baseFeePerGas: '0x7',
      priorityFeePerGas: '0x64', // 100
    });
    // the tip follows the L1 base fee and gets the L1 cost headroom
    await expect(estimateTxFees(client, CHAINS.Linea, tx)).resolves.toEqual({
      maxPriorityFeePerGas: 125n,
      maxFeePerGas: 14n + 125n,
      gasLimit: 0x30000n,
      l1Fee: 0n,
    });
  });

  it('linea: fails the quote, after a warning, when linea_estimateGas fails', async () => {
    const { client } = lineaClient({}, true);
    await expect(estimateTxFees(client, CHAINS.Linea, tx)).rejects.toThrow(
      'method not found',
    );
    expect(console.warn).toHaveBeenCalledWith(
      '[fees::linea] tx fees quote failed',
      expect.any(Error),
    );
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
        gasPriceOracleAddress: '0x420000000000000000000000000000000000000F',
      }),
    );
  });

  it('op-stack: fails the quote, after a warning, when the oracle call fails', async () => {
    vi.mocked(estimateL1Fee).mockRejectedValue(new Error('oracle down'));
    await expect(
      estimateTxFees({} as FeeClient, CHAINS.Optimism, tx),
    ).rejects.toThrow('oracle down');
    expect(console.warn).toHaveBeenCalledWith(
      '[fees::op-stack] tx fees quote failed',
      expect.any(Error),
    );
  });

  it('ethereum and arbitrum: no tx-specific parts and no RPC call', async () => {
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

describe('estimateSendFees', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('linea: the exact quote, unbuffered', async () => {
    const { client } = lineaClient({
      gasLimit: '0x30000',
      baseFeePerGas: '0x7',
      priorityFeePerGas: '0x64',
    });
    await expect(estimateSendFees(client, CHAINS.Linea, tx)).resolves.toEqual({
      maxFeePerGas: 14n + 100n,
      maxPriorityFeePerGas: 100n,
    });
  });

  it('linea: keeps the core price when the quote fails', async () => {
    const { client } = lineaClient({}, true);
    await expect(
      estimateSendFees(client, CHAINS.Linea, tx),
    ).resolves.toBeUndefined();
  });

  it('other models: keep the core price without an RPC call', async () => {
    const { client, request } = lineaClient({});
    for (const chainId of [CHAINS.Mainnet, CHAINS.Base, CHAINS.Arbitrum]) {
      await expect(
        estimateSendFees(client, chainId, tx),
      ).resolves.toBeUndefined();
    }
    expect(request).not.toHaveBeenCalled();
  });
});
