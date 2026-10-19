import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../utils/validate-tx-signing', () => ({
  validateSendTransaction: vi.fn(),
  validateSendCalls: vi.fn(),
  extractApprovals: vi.fn(() => []),
  sanitizeTransactionParams: vi.fn(
    (_method: string, params: unknown) => params,
  ),
}));

vi.mock('../utils/validate-typed-message', () => ({
  validateSignTypedData: vi.fn(),
}));

import { validateRpcRequest } from '../validate-tx';
import {
  extractApprovals,
  sanitizeTransactionParams,
  validateSendTransaction,
  validateSendCalls,
  validateSignTypedData,
} from '../utils';
import type { OrderData } from '../utils';

import {
  MAINNET_TX_CONFIG,
  SEPOLIA_TX_CONFIG,
  TEST_APP_CODE,
} from './fixtures';

const CHAIN_MAINNET = 1;
const CHAIN_SEPOLIA = 11155111;
const CHAIN_POLYGON = 137;

const SIGNER = '0x2222222222222222222222222222222222222222' as `0x${string}`;

const mainnetCtx = {
  chainId: CHAIN_MAINNET,
  signer: SIGNER,
  networkTxConfig: MAINNET_TX_CONFIG,
  appCode: TEST_APP_CODE,
};
const sepoliaCtx = {
  chainId: CHAIN_SEPOLIA,
  signer: SIGNER,
  networkTxConfig: SEPOLIA_TX_CONFIG,
  appCode: TEST_APP_CODE,
};
const polygonCtx = {
  chainId: CHAIN_POLYGON,
  signer: SIGNER,
  networkTxConfig: MAINNET_TX_CONFIG,
  appCode: TEST_APP_CODE,
};

const makeRequest = (method: string, params: unknown[] = []) => ({
  method,
  params,
  id: 1,
});

const MOCK_ORDER: OrderData = {
  sellToken: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
  buyToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  sellAmount: 1000000000000000000n,
  buyAmount: 950000000000000000n,
  validTo: 9999999999,
  kind: 'sell',
  partiallyFillable: false,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  receiver: SIGNER,
  feeAmount: 0n,
  sellTokenBalance: 'erc20',
  buyTokenBalance: 'erc20',
};

beforeEach(() => {
  vi.mocked(validateSignTypedData).mockResolvedValue({
    allowed: true,
    result: undefined,
  });
  vi.mocked(validateSendTransaction).mockResolvedValue({
    allowed: true,
    result: undefined,
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
        validateRpcRequest({ params: [], id: 1 }, mainnetCtx),
      ).rejects.toThrow();
    });

    it('throws for non-string method', async () => {
      await expect(
        validateRpcRequest({ method: 123, params: [], id: 1 }, mainnetCtx),
      ).rejects.toThrow();
    });

    it('throws for null input', async () => {
      await expect(validateRpcRequest(null, mainnetCtx)).rejects.toThrow();
    });

    it('accepts valid request without params field', async () => {
      await expect(
        validateRpcRequest({ method: 'eth_chainId', id: 1 }, mainnetCtx),
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
          validateRpcRequest(makeRequest(method), polygonCtx),
        ).rejects.toThrow();
      },
    );

    it.each(signingMethods)('%s is allowed on mainnet', async (method) => {
      await expect(
        validateRpcRequest(makeRequest(method), mainnetCtx),
      ).resolves.toBeDefined();
    });

    it.each(signingMethods)('%s is allowed on sepolia', async (method) => {
      await expect(
        validateRpcRequest(makeRequest(method), sepoliaCtx),
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
        validateRpcRequest(makeRequest('eth_signTypedData_v4'), mainnetCtx),
      ).rejects.toThrow();
    });

    it('returns order=undefined when allowed but no result', async () => {
      vi.mocked(validateSignTypedData).mockResolvedValue({
        allowed: true,
        result: undefined,
      });
      const { order } = await validateRpcRequest(
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
      const { order } = await validateRpcRequest(
        makeRequest('eth_signTypedData_v4'),
        mainnetCtx,
      );
      expect(order).toBe(MOCK_ORDER);
    });

    it('passes params and ctx to validateSignTypedData', async () => {
      const params = ['0xsigner', '{"typed":"data"}'];
      await validateRpcRequest(
        makeRequest('eth_signTypedData_v4', params),
        mainnetCtx,
      );
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
        validateRpcRequest(makeRequest('eth_sendTransaction'), mainnetCtx),
      ).rejects.toThrow('Transaction to unknown target');
    });

    it('returns order when validateSendTransaction provides result', async () => {
      vi.mocked(validateSendTransaction).mockResolvedValue({
        allowed: true,
        result: MOCK_ORDER,
      });
      const { order } = await validateRpcRequest(
        makeRequest('eth_sendTransaction'),
        mainnetCtx,
      );
      expect(order).toBe(MOCK_ORDER);
    });

    it('passes params and ctx to validateSendTransaction', async () => {
      const params = [{ to: '0xabc', data: '0x1234' }];
      await validateRpcRequest(
        makeRequest('eth_sendTransaction', params),
        mainnetCtx,
      );
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
        validateRpcRequest(makeRequest('wallet_sendCalls'), mainnetCtx),
      ).rejects.toThrow();
    });

    it('returns order when validateSendCalls provides result', async () => {
      vi.mocked(validateSendCalls).mockResolvedValue({
        allowed: true,
        result: MOCK_ORDER,
      });
      const { order } = await validateRpcRequest(
        makeRequest('wallet_sendCalls'),
        mainnetCtx,
      );
      expect(order).toBe(MOCK_ORDER);
    });

    it('passes params and ctx to validateSendCalls', async () => {
      const params = [{ calls: [] }];
      await validateRpcRequest(
        makeRequest('wallet_sendCalls', params),
        mainnetCtx,
      );
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
        const result = await validateRpcRequest(
          makeRequest(method),
          mainnetCtx,
        );
        expect(result).toBeDefined();
        expect(result.order).toBeUndefined();
        expect(vi.mocked(validateSignTypedData)).not.toHaveBeenCalled();
        expect(vi.mocked(validateSendTransaction)).not.toHaveBeenCalled();
        expect(vi.mocked(validateSendCalls)).not.toHaveBeenCalled();
      },
    );

    it.each(allowedAaMethods)('%s passes through', async (method) => {
      const result = await validateRpcRequest(makeRequest(method), mainnetCtx);
      expect(result).toBeDefined();
      expect(result.order).toBeUndefined();
    });

    it('throws for personal_sign (not in allowlist)', async () => {
      await expect(
        validateRpcRequest(makeRequest('personal_sign'), mainnetCtx),
      ).rejects.toThrow();
    });

    it('throws for eth_sign (not in allowlist)', async () => {
      await expect(
        validateRpcRequest(makeRequest('eth_sign'), mainnetCtx),
      ).rejects.toThrow();
    });

    it('throws for completely unknown method', async () => {
      await expect(
        validateRpcRequest(makeRequest('some_unknown_method'), mainnetCtx),
      ).rejects.toThrow();
    });
  });

  describe('return value', () => {
    it('returns sanitizedRequest with correct method and id', async () => {
      const { sanitizedRequest } = await validateRpcRequest(
        makeRequest('eth_chainId', ['0x1']),
        mainnetCtx,
      );
      expect(sanitizedRequest.method).toBe('eth_chainId');
      expect(sanitizedRequest.id).toBe(1);
    });

    it('returns order=undefined for non-signing methods', async () => {
      const { order } = await validateRpcRequest(
        makeRequest('eth_chainId'),
        mainnetCtx,
      );
      expect(order).toBeUndefined();
    });

    it('does not carry over order from a previous signing call', async () => {
      vi.mocked(validateSendTransaction).mockResolvedValue({
        allowed: true,
        result: undefined,
      });
      const { order } = await validateRpcRequest(
        makeRequest('eth_sendTransaction'),
        mainnetCtx,
      );
      expect(order).toBeUndefined();
    });
  });
});

describe('validateRpcRequest — approvals', () => {
  it('returns approves of an allowed transaction', async () => {
    const approval = {
      token: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' as `0x${string}`,
      amount: 1n,
    };
    vi.mocked(validateSendTransaction).mockResolvedValue({
      allowed: true,
      result: undefined,
    });
    vi.mocked(extractApprovals).mockReturnValueOnce([approval]);
    const request = makeRequest('eth_sendTransaction');

    const { approvals } = await validateRpcRequest(request, mainnetCtx);

    expect(approvals).toEqual([approval]);
    expect(extractApprovals).toHaveBeenCalledWith(
      'eth_sendTransaction',
      request.params,
    );
  });
});

describe('validateRpcRequest — sanitized params', () => {
  it('forwards params sanitized for the method', async () => {
    vi.mocked(validateSendTransaction).mockResolvedValue({
      allowed: true,
      result: undefined,
    });
    vi.mocked(sanitizeTransactionParams).mockReturnValueOnce(['clean']);
    const request = makeRequest('eth_sendTransaction', [{ dirty: true }]);

    const { sanitizedRequest } = await validateRpcRequest(request, mainnetCtx);

    expect(sanitizedRequest.params).toEqual(['clean']);
    expect(sanitizeTransactionParams).toHaveBeenCalledWith(
      'eth_sendTransaction',
      request.params,
    );
  });
});
