/* eslint-disable func-style */
/* eslint-disable import/no-extraneous-dependencies */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../validate-tx-signing', () => ({
  validateSendTransaction: vi.fn(),
  validateSendCalls: vi.fn(),
}));

vi.mock('../validate-typed-message', () => ({
  validateSignTypedData: vi.fn(),
}));

import { validateTx } from '../validate-tx';
import {
  validateSendTransaction,
  validateSendCalls,
} from '../validate-tx-signing';
import { validateSignTypedData } from '../validate-typed-message';
import type { OrderData } from '../utils';

const CHAIN_MAINNET = 1;
const CHAIN_SEPOLIA = 11155111;
const CHAIN_POLYGON = 137;

const SIGNER = '0x2222222222222222222222222222222222222222' as `0x${string}`;

const mainnetCtx = { chainId: CHAIN_MAINNET, signer: SIGNER };
const sepoliaCtx = { chainId: CHAIN_SEPOLIA, signer: SIGNER };
const polygonCtx = { chainId: CHAIN_POLYGON, signer: SIGNER };

const makeRequest = (method: string, params: unknown[] = []) => ({
  method,
  params,
  id: 1,
});

const MOCK_ORDER: OrderData = {
  sellToken: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' as `0x${string}`,
  buyToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' as `0x${string}`,
  sellAmount: 1000000000000000000n,
  buyAmount: 950000000000000000n,
  validTo: 9999999999,
  kind: 'sell',
  partiallyFillable: false,
  appData:
    '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  receiver: SIGNER,
  feeAmount: 0n,
  sellTokenBalance: 'erc20',
  buyTokenBalance: 'erc20',
};

beforeEach(() => {
  vi.mocked(validateSignTypedData).mockResolvedValue({
    allowed: true,
    result: undefined as any,
  });
  vi.mocked(validateSendTransaction).mockResolvedValue({
    allowed: true,
    result: undefined as any,
  });
  vi.mocked(validateSendCalls).mockResolvedValue({
    allowed: true,
    result: undefined as any,
  });
});

afterEach(() => vi.resetAllMocks());

// ================================================================

describe('validateTx', () => {
  describe('request parsing', () => {
    it('throws for missing method', async () => {
      await expect(
        validateTx({ params: [], id: 1 }, mainnetCtx),
      ).rejects.toThrow('Invalid JSON-RPC request');
    });

    it('throws for non-string method', async () => {
      await expect(
        validateTx({ method: 123, params: [], id: 1 }, mainnetCtx),
      ).rejects.toThrow('Invalid JSON-RPC request');
    });

    it('throws for null input', async () => {
      await expect(validateTx(null, mainnetCtx)).rejects.toThrow(
        'Invalid JSON-RPC request',
      );
    });

    it('accepts valid request without params field', async () => {
      await expect(
        validateTx({ method: 'eth_chainId', id: 1 }, mainnetCtx),
      ).resolves.toBeDefined();
    });
  });

  describe('chain restriction for signing methods', () => {
    const signingMethods = [
      'eth_signTypedData_v4',
      'eth_sendTransaction',
      'wallet_sendCalls',
    ] as const;

    it.each(signingMethods)(
      '%s throws on unsupported chain',
      async (method) => {
        await expect(
          validateTx(makeRequest(method), polygonCtx),
        ).rejects.toThrow(`Signing is not allowed on chainId ${CHAIN_POLYGON}`);
      },
    );

    it.each(signingMethods)('%s is allowed on mainnet', async (method) => {
      await expect(
        validateTx(makeRequest(method), mainnetCtx),
      ).resolves.toBeDefined();
    });

    it.each(signingMethods)('%s is allowed on sepolia', async (method) => {
      await expect(
        validateTx(makeRequest(method), sepoliaCtx),
      ).resolves.toBeDefined();
    });
  });

  describe('eth_signTypedData_v4', () => {
    it('throws when validateSignTypedData blocks', async () => {
      vi.mocked(validateSignTypedData).mockResolvedValue({
        allowed: false,
        reason: 'Invalid order structure',
      });
      await expect(
        validateTx(makeRequest('eth_signTypedData_v4'), mainnetCtx),
      ).rejects.toThrow('Invalid order structure');
    });

    it('returns order=undefined when allowed but no result', async () => {
      vi.mocked(validateSignTypedData).mockResolvedValue({
        allowed: true,
        result: undefined as any,
      });
      const { order } = await validateTx(
        makeRequest('eth_signTypedData_v4'),
        mainnetCtx,
      );
      expect(order).toBeUndefined();
    });

    it('returns order when validateSignTypedData provides result', async () => {
      vi.mocked(validateSignTypedData).mockResolvedValue({
        allowed: true,
        result: MOCK_ORDER,
      });
      const { order } = await validateTx(
        makeRequest('eth_signTypedData_v4'),
        mainnetCtx,
      );
      expect(order).toBe(MOCK_ORDER);
    });

    it('passes params and ctx to validateSignTypedData', async () => {
      const params = ['0xsigner', '{"typed":"data"}'];
      await validateTx(makeRequest('eth_signTypedData_v4', params), mainnetCtx);
      expect(vi.mocked(validateSignTypedData)).toHaveBeenCalledWith(
        params,
        mainnetCtx,
      );
    });
  });

  describe('eth_sendTransaction', () => {
    it('throws when validateSendTransaction blocks', async () => {
      vi.mocked(validateSendTransaction).mockResolvedValue({
        allowed: false,
        reason: 'Transaction to unknown target',
      });
      await expect(
        validateTx(makeRequest('eth_sendTransaction'), mainnetCtx),
      ).rejects.toThrow('Transaction to unknown target');
    });

    it('returns order when validateSendTransaction provides result', async () => {
      vi.mocked(validateSendTransaction).mockResolvedValue({
        allowed: true,
        result: MOCK_ORDER,
      });
      const { order } = await validateTx(
        makeRequest('eth_sendTransaction'),
        mainnetCtx,
      );
      expect(order).toBe(MOCK_ORDER);
    });

    it('passes params and ctx to validateSendTransaction', async () => {
      const params = [{ to: '0xabc', data: '0x1234' }];
      await validateTx(makeRequest('eth_sendTransaction', params), mainnetCtx);
      expect(vi.mocked(validateSendTransaction)).toHaveBeenCalledWith(
        params,
        mainnetCtx,
      );
    });
  });

  describe('wallet_sendCalls', () => {
    it('throws when validateSendCalls blocks', async () => {
      vi.mocked(validateSendCalls).mockResolvedValue({
        allowed: false,
        reason: 'Multiple order messages in batch',
      });
      await expect(
        validateTx(makeRequest('wallet_sendCalls'), mainnetCtx),
      ).rejects.toThrow('Multiple order messages in batch');
    });

    it('returns order when validateSendCalls provides result', async () => {
      vi.mocked(validateSendCalls).mockResolvedValue({
        allowed: true,
        result: MOCK_ORDER,
      });
      const { order } = await validateTx(
        makeRequest('wallet_sendCalls'),
        mainnetCtx,
      );
      expect(order).toBe(MOCK_ORDER);
    });

    it('passes params and ctx to validateSendCalls', async () => {
      const params = [{ calls: [] }];
      await validateTx(makeRequest('wallet_sendCalls', params), mainnetCtx);
      expect(vi.mocked(validateSendCalls)).toHaveBeenCalledWith(
        params,
        mainnetCtx,
      );
    });
  });

  describe('RPC method allowlist', () => {
    const allowedReadOnlyMethods = [
      'eth_accounts',
      'eth_chainId',
      'eth_call',
      'eth_estimateGas',
      'eth_getBalance',
      'eth_getTransactionReceipt',
      'eth_getTransactionCount',
      'eth_feeHistory',
    ];

    const allowedAaMethods = [
      'wallet_getCapabilities',
      'wallet_showCallsStatus',
      'wallet_getCallsStatus',
    ];

    it.each(allowedReadOnlyMethods)(
      '%s passes through without calling sub-validators',
      async (method) => {
        const result = await validateTx(makeRequest(method), mainnetCtx);
        expect(result).toBeDefined();
        expect(result.order).toBeUndefined();
        expect(vi.mocked(validateSignTypedData)).not.toHaveBeenCalled();
        expect(vi.mocked(validateSendTransaction)).not.toHaveBeenCalled();
        expect(vi.mocked(validateSendCalls)).not.toHaveBeenCalled();
      },
    );

    it.each(allowedAaMethods)('%s passes through', async (method) => {
      const result = await validateTx(makeRequest(method), mainnetCtx);
      expect(result).toBeDefined();
      expect(result.order).toBeUndefined();
    });

    it('throws for personal_sign (not in allowlist)', async () => {
      await expect(
        validateTx(makeRequest('personal_sign'), mainnetCtx),
      ).rejects.toThrow('RPC method "personal_sign" is not allowed');
    });

    it('throws for eth_sign (not in allowlist)', async () => {
      await expect(
        validateTx(makeRequest('eth_sign'), mainnetCtx),
      ).rejects.toThrow('RPC method "eth_sign" is not allowed');
    });

    it('throws for completely unknown method', async () => {
      await expect(
        validateTx(makeRequest('some_unknown_method'), mainnetCtx),
      ).rejects.toThrow('RPC method "some_unknown_method" is not allowed');
    });
  });

  describe('return value', () => {
    it('returns sanitizedRequest with correct method and id', async () => {
      const { sanitizedRequest } = await validateTx(
        makeRequest('eth_chainId', ['0x1']),
        mainnetCtx,
      );
      expect(sanitizedRequest.method).toBe('eth_chainId');
      expect(sanitizedRequest.id).toBe(1);
    });

    it('returns order=undefined for non-signing methods', async () => {
      const { order } = await validateTx(
        makeRequest('eth_chainId'),
        mainnetCtx,
      );
      expect(order).toBeUndefined();
    });

    it('does not carry over order from a previous signing call', async () => {
      vi.mocked(validateSendTransaction).mockResolvedValue({
        allowed: true,
        result: undefined as any,
      });
      const { order } = await validateTx(
        makeRequest('eth_sendTransaction'),
        mainnetCtx,
      );
      expect(order).toBeUndefined();
    });
  });
});
