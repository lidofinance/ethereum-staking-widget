import { describe, it, expect, vi } from 'vitest';
import type { Address, Hex } from 'viem';

vi.mock('viem/op-stack', () => ({ estimateL1Fee: vi.fn() }));
vi.mock('config/networks/contract-address', () => ({
  getContractAddress: vi.fn(),
}));

import { estimateL1Fee } from 'viem/op-stack';
import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'config/chains';
import { composeMaxTxCost, getFeeModel } from '../estimate';
import { GAS_FEE_MODEL } from '../model';
import { FEE_MODELS } from '../models';
import {
  OP_STACK_GAS_PRICE_ORACLE_ADDRESS,
  getOpStackL1Fee,
} from '../models/op-stack';
import type { FeeClient } from '../types';

describe('FEE_MODELS', () => {
  it('defines every model under its own name', () => {
    for (const model of Object.values(GAS_FEE_MODEL)) {
      expect(FEE_MODELS[model].model).toBe(model);
      expect(FEE_MODELS[model].getMaxFee).toBeTypeOf('function');
    }
  });

  it('declares the tx-specific and send quotes where the chain needs them', () => {
    const shape = (model: GAS_FEE_MODEL) => ({
      txFees: !!FEE_MODELS[model].getTxFees,
      sendFees: !!FEE_MODELS[model].getSendFees,
    });
    expect(shape(GAS_FEE_MODEL.Ethereum)).toEqual({
      txFees: false,
      sendFees: false,
    });
    expect(shape(GAS_FEE_MODEL.Arbitrum)).toEqual({
      txFees: false,
      sendFees: false,
    });
    expect(shape(GAS_FEE_MODEL.OpStack)).toEqual({
      txFees: true,
      sendFees: false,
    });
    expect(shape(GAS_FEE_MODEL.Linea)).toEqual({
      txFees: true,
      sendFees: true,
    });
  });

  it('resolves a chain to its model', () => {
    expect(getFeeModel(CHAINS.Base)).toBe(FEE_MODELS[GAS_FEE_MODEL.OpStack]);
    expect(getFeeModel(undefined)).toBe(FEE_MODELS[GAS_FEE_MODEL.Ethereum]);
  });
});

describe('getOpStackL1Fee', () => {
  const tx = {
    account: '0x1111111111111111111111111111111111111111' as Address,
    to: '0x2222222222222222222222222222222222222222' as Address,
    data: '0xabcdef' as Hex,
    value: 5n,
  };
  const client = {} as FeeClient;

  it('quotes the oracle from the network config so the proxy lets the call through', async () => {
    const configured = '0x00000000000000000000000000000000000000ab' as Address;
    vi.mocked(getContractAddress).mockReturnValueOnce(configured);
    vi.mocked(estimateL1Fee).mockResolvedValueOnce(7n);
    await expect(getOpStackL1Fee(client, CHAINS.Base, tx)).resolves.toBe(7n);
    expect(getContractAddress).toHaveBeenCalledWith(
      CHAINS.Base,
      'L2GasPriceOracle',
    );
    expect(estimateL1Fee).toHaveBeenCalledWith(client, {
      account: tx.account,
      to: tx.to,
      data: tx.data,
      value: tx.value,
      gasPriceOracleAddress: configured,
    });
  });

  it('falls back to the predeploy address when the network config has none', async () => {
    vi.mocked(getContractAddress).mockReturnValueOnce(undefined);
    vi.mocked(estimateL1Fee).mockResolvedValueOnce(9n);
    await expect(getOpStackL1Fee(client, CHAINS.Optimism, tx)).resolves.toBe(
      9n,
    );
    expect(estimateL1Fee).toHaveBeenLastCalledWith(
      client,
      expect.objectContaining({
        gasPriceOracleAddress: OP_STACK_GAS_PRICE_ORACLE_ADDRESS,
      }),
    );
  });
});

describe('composeMaxTxCost', () => {
  it('is the chain-wide price times the gas limit without tx-specific parts', () => {
    expect(
      composeMaxTxCost({
        gasLimit: 100n,
        maxGasPrice: 3n,
        isTxFeesNeeded: false,
      }),
    ).toBe(300n);
  });

  it('adds the L1 data fee and keeps the chain-wide price (OP-stack)', () => {
    expect(
      composeMaxTxCost({
        gasLimit: 100n,
        maxGasPrice: 3n,
        txFees: { l1Fee: 50n },
        isTxFeesNeeded: true,
      }),
    ).toBe(350n);
  });

  it('takes the quoted price and the larger gas limit (Linea)', () => {
    const txFees = { maxFeePerGas: 2n, gasLimit: 120n, l1Fee: 0n };
    expect(
      composeMaxTxCost({
        gasLimit: 100n,
        maxGasPrice: 3n,
        txFees,
        isTxFeesNeeded: true,
      }),
    ).toBe(240n);
    expect(
      composeMaxTxCost({
        gasLimit: 150n,
        maxGasPrice: 3n,
        txFees,
        isTxFeesNeeded: true,
      }),
    ).toBe(300n);
  });

  it('waits rather than understating', () => {
    expect(
      composeMaxTxCost({
        gasLimit: 100n,
        maxGasPrice: 3n,
        isTxFeesNeeded: true,
      }),
    ).toBeUndefined();
    expect(
      composeMaxTxCost({ maxGasPrice: 3n, isTxFeesNeeded: false }),
    ).toBeUndefined();
    expect(
      composeMaxTxCost({ gasLimit: 100n, isTxFeesNeeded: false }),
    ).toBeUndefined();
  });

  it('a failed quote still yields a cost from the chain-wide price', () => {
    expect(
      composeMaxTxCost({
        gasLimit: 100n,
        maxGasPrice: 3n,
        txFees: { l1Fee: 0n },
        isTxFeesNeeded: true,
      }),
    ).toBe(300n);
  });
});
