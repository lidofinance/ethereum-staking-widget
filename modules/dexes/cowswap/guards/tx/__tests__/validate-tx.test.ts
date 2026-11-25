import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../utils/validate-send-transaction', () => ({
  validateSendTransaction: vi.fn(),
}));

vi.mock('../utils/validate-send-calls', () => ({
  validateSendCalls: vi.fn(),
}));

vi.mock('../utils/params', () => ({
  extractApprovals: vi.fn(() => []),
  hasWethDeposit: vi.fn(() => false),
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
  hasWethDeposit,
  sanitizeTransactionParams,
  validateSendTransaction,
  validateSendCalls,
  validateSignTypedData,
} from '../utils';
import type { OrderData } from '../utils';

import {
  MAINNET_CTX,
  MAINNET_TX_CONFIG,
  SEPOLIA_CTX,
  SIGNER,
  TEST_APP_CODE,
} from './fixtures';

const CHAIN_POLYGON = 137;

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
        validateRpcRequest({ params: [], id: 1 }, MAINNET_CTX),
      ).rejects.toThrow();
    });

    it('throws for non-string method', async () => {
      await expect(
        validateRpcRequest({ method: 123, params: [], id: 1 }, MAINNET_CTX),
      ).rejects.toThrow();
    });

    it('throws for null input', async () => {
      await expect(validateRpcRequest(null, MAINNET_CTX)).rejects.toThrow();
    });

    it('accepts valid request without params field', async () => {
      await expect(
        validateRpcRequest({ method: 'eth_chainId', id: 1 }, MAINNET_CTX),
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
        validateRpcRequest(makeRequest(method), MAINNET_CTX),
      ).resolves.toBeDefined();
    });

    it.each(signingMethods)('%s is allowed on sepolia', async (method) => {
      await expect(
        validateRpcRequest(makeRequest(method), SEPOLIA_CTX),
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
        validateRpcRequest(makeRequest('eth_signTypedData_v4'), MAINNET_CTX),
      ).rejects.toThrow();
    });

    it('returns order=undefined when allowed but no result', async () => {
      vi.mocked(validateSignTypedData).mockResolvedValue({
        allowed: true,
        result: undefined,
      });
      const { order } = await validateRpcRequest(
        makeRequest('eth_signTypedData_v4'),
        MAINNET_CTX,
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
        MAINNET_CTX,
      );
      expect(order).toBe(MOCK_ORDER);
    });

    it('passes params and ctx to validateSignTypedData', async () => {
      const params = ['0xsigner', '{"typed":"data"}'];
      await validateRpcRequest(
        makeRequest('eth_signTypedData_v4', params),
        MAINNET_CTX,
      );
      expect(vi.mocked(validateSignTypedData)).toHaveBeenCalledWith(
        params,
        MAINNET_CTX,
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
        validateRpcRequest(makeRequest('eth_sendTransaction'), MAINNET_CTX),
      ).rejects.toThrow('Transaction to unknown target');
    });

    it('returns order when validateSendTransaction provides result', async () => {
      vi.mocked(validateSendTransaction).mockResolvedValue({
        allowed: true,
        result: MOCK_ORDER,
      });
      const { order } = await validateRpcRequest(
        makeRequest('eth_sendTransaction'),
        MAINNET_CTX,
      );
      expect(order).toBe(MOCK_ORDER);
    });

    it('passes params and ctx to validateSendTransaction', async () => {
      const params = [{ to: '0xabc', data: '0x1234' }];
      await validateRpcRequest(
        makeRequest('eth_sendTransaction', params),
        MAINNET_CTX,
      );
      expect(vi.mocked(validateSendTransaction)).toHaveBeenCalledWith(
        params,
        MAINNET_CTX,
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
        validateRpcRequest(makeRequest('wallet_sendCalls'), MAINNET_CTX),
      ).rejects.toThrow();
    });

    it('returns order when validateSendCalls provides result', async () => {
      vi.mocked(validateSendCalls).mockResolvedValue({
        allowed: true,
        result: MOCK_ORDER,
      });
      const { order } = await validateRpcRequest(
        makeRequest('wallet_sendCalls'),
        MAINNET_CTX,
      );
      expect(order).toBe(MOCK_ORDER);
    });

    it('passes params and ctx to validateSendCalls', async () => {
      const params = [{ calls: [] }];
      await validateRpcRequest(
        makeRequest('wallet_sendCalls', params),
        MAINNET_CTX,
      );
      expect(vi.mocked(validateSendCalls)).toHaveBeenCalledWith(
        params,
        MAINNET_CTX,
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
          MAINNET_CTX,
        );
        expect(result).toBeDefined();
        expect(result.order).toBeUndefined();
        expect(vi.mocked(validateSignTypedData)).not.toHaveBeenCalled();
        expect(vi.mocked(validateSendTransaction)).not.toHaveBeenCalled();
        expect(vi.mocked(validateSendCalls)).not.toHaveBeenCalled();
      },
    );

    it.each(allowedAaMethods)('%s passes through', async (method) => {
      const result = await validateRpcRequest(makeRequest(method), MAINNET_CTX);
      expect(result).toBeDefined();
      expect(result.order).toBeUndefined();
    });

    it('throws for personal_sign (not in allowlist)', async () => {
      await expect(
        validateRpcRequest(makeRequest('personal_sign'), MAINNET_CTX),
      ).rejects.toThrow();
    });

    it('throws for eth_sign (not in allowlist)', async () => {
      await expect(
        validateRpcRequest(makeRequest('eth_sign'), MAINNET_CTX),
      ).rejects.toThrow();
    });

    it('throws for completely unknown method', async () => {
      await expect(
        validateRpcRequest(makeRequest('some_unknown_method'), MAINNET_CTX),
      ).rejects.toThrow();
    });
  });

  describe('return value', () => {
    it('returns sanitizedRequest with correct method and id', async () => {
      const { sanitizedRequest } = await validateRpcRequest(
        makeRequest('eth_chainId', ['0x1']),
        MAINNET_CTX,
      );
      expect(sanitizedRequest.method).toBe('eth_chainId');
      expect(sanitizedRequest.id).toBe(1);
    });

    it('returns order=undefined for non-signing methods', async () => {
      const { order } = await validateRpcRequest(
        makeRequest('eth_chainId'),
        MAINNET_CTX,
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
        MAINNET_CTX,
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

    const { approvals } = await validateRpcRequest(request, MAINNET_CTX);

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

    const { sanitizedRequest } = await validateRpcRequest(request, MAINNET_CTX);

    expect(sanitizedRequest.params).toEqual(['clean']);
    expect(sanitizeTransactionParams).toHaveBeenCalledWith(
      'eth_sendTransaction',
      request.params,
    );
  });
});

describe('validateRpcRequest — Safe ETH sale approvals', () => {
  it('checks the WETH approve of an ETH sale as native ETH', async () => {
    const weth = MAINNET_TX_CONFIG.weth;
    vi.mocked(validateSendCalls).mockResolvedValue({
      allowed: true,
      result: {
        ...MOCK_ORDER,
        sellToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      },
    });
    vi.mocked(extractApprovals).mockReturnValueOnce([
      { token: weth, amount: 5n },
    ]);
    vi.mocked(hasWethDeposit).mockReturnValueOnce(true);

    const { approvals } = await validateRpcRequest(
      makeRequest('wallet_sendCalls'),
      MAINNET_CTX,
    );

    expect(approvals).toEqual([
      { token: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', amount: 5n },
    ]);
  });

  it('keeps the WETH approve as WETH without a wrap in the batch', async () => {
    const weth = MAINNET_TX_CONFIG.weth;
    vi.mocked(validateSendCalls).mockResolvedValue({
      allowed: true,
      result: {
        ...MOCK_ORDER,
        sellToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      },
    });
    vi.mocked(extractApprovals).mockReturnValueOnce([
      { token: weth, amount: 5n },
    ]);

    const { approvals } = await validateRpcRequest(
      makeRequest('wallet_sendCalls'),
      MAINNET_CTX,
    );

    expect(approvals).toEqual([{ token: weth, amount: 5n }]);
  });
});
