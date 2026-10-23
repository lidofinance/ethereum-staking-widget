import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));

vi.mock('utils/getErrorMessage', () => ({
  ErrorMessage: {
    SOMETHING_WRONG: 'Something went wrong.',
    DENIED_SIG: 'User denied the transaction signature.',
    ENABLE_BLIND_SIGNING: 'enable blind signing',
    DEVICE_LOCKED: 'unlock device',
  },
  extractCodeFromError: vi.fn(),
}));

vi.mock('../../guards/tx', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../guards/tx')>()),
  validateRpcRequest: vi.fn(),
}));

import type { JsonRpcRequest } from '@cowprotocol/widget-react';
import { InvalidRequestRpcError, UserRejectedRequestError } from 'viem';

import { trackMatomoEvent } from 'utils/track-matomo-event';
import { extractCodeFromError } from 'utils/getErrorMessage';

import {
  TRANSACTION_ERROR,
  validateRpcRequest,
  SIGN_DECLINED_MESSAGE,
  SIGN_DECLINED_HELP_TIP,
  type OrderData,
} from '../../guards/tx';
import { MAINNET_TX_CONFIG } from '../../guards/tx/__tests__/fixtures';
import {
  createCowSwapProvider,
  type CreateCowSwapProviderParams,
} from '../create-cow-swap-provider';

const SIGNER = '0x2222222222222222222222222222222222222222';
const ORDER = { sellToken: '0x01' } as unknown as OrderData;

type EmitterHandler = (args: unknown) => void;

const makeConnector = () => {
  const handlers = new Map<string, Set<EmitterHandler>>();
  return {
    handlers,
    emitter: {
      on: vi.fn((event: string, fn: EmitterHandler) => {
        const set = handlers.get(event) ?? new Set<EmitterHandler>();
        set.add(fn);
        handlers.set(event, set);
      }),
      off: vi.fn((event: string, fn: EmitterHandler) => {
        handlers.get(event)?.delete(fn);
      }),
    },
    emit: (event: string, args: unknown) =>
      handlers.get(event)?.forEach((fn) => fn(args)),
  };
};

const setup = (overrides: Partial<CreateCowSwapProviderParams> = {}) => {
  const walletClient = {
    account: { address: SIGNER },
    request: vi.fn().mockResolvedValue('0xresult'),
    getChainId: vi.fn().mockResolvedValue(1),
    getAddresses: vi.fn().mockResolvedValue([SIGNER]),
  };
  const connector = makeConnector();
  const cleanups: (() => void)[] = [];
  const params = {
    walletClient,
    connector,
    chainId: 1,
    isLedgerLive: false,
    networkTxConfig: MAINNET_TX_CONFIG,
    appCode: 'Test App',
    consumeSignedOrder: vi.fn().mockReturnValue(null),
    verifyApproval: vi.fn().mockReturnValue(null),
    openTransactionGuardModal: vi.fn().mockResolvedValue(undefined),
    openSigningErrorModal: vi.fn().mockResolvedValue(undefined),
    addCleanup: (fn: () => void) => cleanups.push(fn),
    ...overrides,
  } as unknown as CreateCowSwapProviderParams;

  return {
    provider: createCowSwapProvider(params),
    params,
    walletClient,
    connector,
    cleanups,
  };
};

const rpc = (method: string, params: unknown[] = []): JsonRpcRequest => ({
  id: 1,
  method,
  params,
});

const SIGN_REQUEST = rpc('eth_signTypedData_v4', [SIGNER, '{}']);

beforeEach(() => {
  vi.mocked(validateRpcRequest).mockImplementation(
    async (payload) =>
      ({ order: undefined, approvals: [], sanitizedRequest: payload }) as never,
  );
  vi.mocked(extractCodeFromError).mockReturnValue(0);
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// request — validation
// ---------------------------------------------------------------------------
describe('request — validation', () => {
  it('passes chainId, signer, networkTxConfig and appCode to validateRpcRequest', async () => {
    const { provider } = setup();
    await provider.request(SIGN_REQUEST);

    expect(validateRpcRequest).toHaveBeenCalledWith(SIGN_REQUEST, {
      chainId: 1,
      signer: SIGNER,
      networkTxConfig: MAINNET_TX_CONFIG,
      appCode: 'Test App',
    });
  });

  it('forwards sanitized request to wallet with dedupe and no retries', async () => {
    const sanitized = rpc('eth_chainId');
    vi.mocked(validateRpcRequest).mockResolvedValue({
      order: undefined,
      approvals: [],
      sanitizedRequest: sanitized,
    });
    const { provider, walletClient } = setup();

    const result = await provider.request({
      ...sanitized,
      extra: 'dropped',
    } as never);

    expect(result).toBe('0xresult');
    expect(walletClient.request).toHaveBeenCalledWith(sanitized, {
      dedupe: true,
      retryCount: 0,
    });
  });

  it('blocks request and opens guard modal when validation throws', async () => {
    vi.mocked(validateRpcRequest).mockRejectedValue(new Error('bad tx'));
    const { provider, params, walletClient } = setup();

    await expect(provider.request(SIGN_REQUEST)).rejects.toEqual({
      code: InvalidRequestRpcError.code,
      message: 'Something went wrong.',
    });
    expect(params.openTransactionGuardModal).toHaveBeenCalledWith('bad tx');
    expect(walletClient.request).not.toHaveBeenCalled();
  });

  it('blocks without modal when validation throws non-Error', async () => {
    vi.mocked(validateRpcRequest).mockRejectedValue('boom');
    const { provider, params, walletClient } = setup();

    await expect(provider.request(SIGN_REQUEST)).rejects.toEqual({
      code: InvalidRequestRpcError.code,
      message: 'Something went wrong.',
    });
    expect(params.openTransactionGuardModal).not.toHaveBeenCalled();
    expect(walletClient.request).not.toHaveBeenCalled();
  });

  it('verifies recovered order and blocks when verification fails', async () => {
    vi.mocked(validateRpcRequest).mockResolvedValue({
      order: ORDER,
      approvals: [],
      sanitizedRequest: SIGN_REQUEST,
    });
    const consumeSignedOrder = vi.fn().mockReturnValue('amount mismatch');
    const { provider, params, walletClient } = setup({ consumeSignedOrder });

    await expect(provider.request(SIGN_REQUEST)).rejects.toMatchObject({
      code: InvalidRequestRpcError.code,
    });
    expect(consumeSignedOrder).toHaveBeenCalledWith(ORDER);
    expect(params.openTransactionGuardModal).toHaveBeenCalledWith(
      'amount mismatch',
    );
    expect(walletClient.request).not.toHaveBeenCalled();
  });

  it('verifies each approve and blocks when verification fails', async () => {
    const approval = { token: ORDER.sellToken, amount: 10n };
    vi.mocked(validateRpcRequest).mockResolvedValue({
      order: undefined,
      approvals: [approval],
      sanitizedRequest: SIGN_REQUEST,
    });
    const verifyApproval = vi.fn().mockReturnValue('approve too large');
    const { provider, params, walletClient } = setup({ verifyApproval });

    await expect(provider.request(SIGN_REQUEST)).rejects.toMatchObject({
      code: InvalidRequestRpcError.code,
    });
    expect(verifyApproval).toHaveBeenCalledWith(approval);
    expect(params.openTransactionGuardModal).toHaveBeenCalledWith(
      'approve too large',
    );
    expect(walletClient.request).not.toHaveBeenCalled();
  });

  it('verifies approvals before the order', async () => {
    const approval = { token: ORDER.sellToken, amount: 10n };
    vi.mocked(validateRpcRequest).mockResolvedValue({
      order: ORDER,
      approvals: [approval],
      sanitizedRequest: SIGN_REQUEST,
    });
    const { provider, params } = setup();

    await provider.request(SIGN_REQUEST);

    // verifying an ETH order consumes the trade snapshot the approve needs
    expect(
      vi.mocked(params.verifyApproval).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(params.consumeSignedOrder).mock.invocationCallOrder[0],
    );
  });

  it('sends request when approve passes verification', async () => {
    const approval = { token: ORDER.sellToken, amount: 10n };
    vi.mocked(validateRpcRequest).mockResolvedValue({
      order: undefined,
      approvals: [approval],
      sanitizedRequest: SIGN_REQUEST,
    });
    const { provider, params, walletClient } = setup();

    await provider.request(SIGN_REQUEST);
    expect(params.verifyApproval).toHaveBeenCalledWith(approval);
    expect(walletClient.request).toHaveBeenCalledTimes(1);
  });

  it('blocks signing when the wallet switched to another chain', async () => {
    const { provider, params, walletClient } = setup();
    walletClient.getChainId.mockResolvedValue(8453);

    await expect(provider.request(SIGN_REQUEST)).rejects.toMatchObject({
      code: InvalidRequestRpcError.code,
    });
    expect(params.openTransactionGuardModal).toHaveBeenCalledWith(
      TRANSACTION_ERROR(2049),
    );
    expect(walletClient.request).not.toHaveBeenCalled();
  });

  it('blocks signing when the wallet switched to another account', async () => {
    const { provider, params, walletClient } = setup();
    walletClient.getAddresses.mockResolvedValue([
      '0x00000000000000000000000000000000000000a1',
    ]);

    await expect(provider.request(SIGN_REQUEST)).rejects.toMatchObject({
      code: InvalidRequestRpcError.code,
    });
    expect(params.openTransactionGuardModal).toHaveBeenCalledWith(
      TRANSACTION_ERROR(2051),
    );
    expect(walletClient.request).not.toHaveBeenCalled();
  });

  it('blocks signing when the wallet exposes no account', async () => {
    const { provider, params, walletClient } = setup();
    walletClient.getAddresses.mockResolvedValue([]);

    await expect(provider.request(SIGN_REQUEST)).rejects.toMatchObject({
      code: InvalidRequestRpcError.code,
    });
    expect(params.openTransactionGuardModal).toHaveBeenCalledWith(
      TRANSACTION_ERROR(2051),
    );
  });

  it('does not check the chain or account for read-only requests', async () => {
    const { provider, walletClient } = setup();
    walletClient.getChainId.mockResolvedValue(8453);
    walletClient.getAddresses.mockResolvedValue([]);

    await provider.request(rpc('eth_chainId', []));
    expect(walletClient.request).toHaveBeenCalledTimes(1);
  });

  it('sends request when recovered order passes verification', async () => {
    vi.mocked(validateRpcRequest).mockResolvedValue({
      order: ORDER,
      approvals: [],
      sanitizedRequest: SIGN_REQUEST,
    });
    const { provider, walletClient } = setup();

    await provider.request(SIGN_REQUEST);
    expect(walletClient.request).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// request — wallet errors
// ---------------------------------------------------------------------------
describe('request — wallet errors', () => {
  const walletError = new Error('wallet failed');

  const setupFailing = (
    code: string | number,
    overrides: Partial<CreateCowSwapProviderParams> = {},
  ) => {
    vi.mocked(extractCodeFromError).mockReturnValue(code);
    const ctx = setup(overrides);
    ctx.walletClient.request.mockRejectedValue(walletError);
    return ctx;
  };

  it('maps ACTION_REJECTED to user rejection without modal', async () => {
    const { provider, params } = setupFailing('ACTION_REJECTED');

    await expect(provider.request(SIGN_REQUEST)).rejects.toEqual({
      code: UserRejectedRequestError.code,
      message: 'User denied the transaction signature.',
    });
    expect(params.openSigningErrorModal).not.toHaveBeenCalled();
    expect(trackMatomoEvent).not.toHaveBeenCalled();
  });

  it('shows Ledger Live decline modal for rejected typed-data signing', async () => {
    const { provider, params } = setupFailing('ACTION_REJECTED', {
      isLedgerLive: true,
    });

    await expect(provider.request(SIGN_REQUEST)).rejects.toMatchObject({
      code: UserRejectedRequestError.code,
    });
    expect(trackMatomoEvent).toHaveBeenCalledTimes(1);
    expect(params.openSigningErrorModal).toHaveBeenCalledWith(
      SIGN_DECLINED_MESSAGE,
      SIGN_DECLINED_HELP_TIP,
    );
  });

  it('skips Ledger Live modal for non-signing methods', async () => {
    const { provider, params } = setupFailing('ACTION_REJECTED', {
      isLedgerLive: true,
    });

    await expect(
      provider.request(rpc('eth_sendTransaction')),
    ).rejects.toMatchObject({ code: UserRejectedRequestError.code });
    expect(params.openSigningErrorModal).not.toHaveBeenCalled();
  });

  it.each([
    ['ENABLE_BLIND_SIGNING', 'enable blind signing'],
    ['DEVICE_LOCKED', 'unlock device'],
  ])('maps %s to modal and user rejection', async (code, message) => {
    const { provider, params } = setupFailing(code);

    await expect(provider.request(SIGN_REQUEST)).rejects.toEqual({
      code: UserRejectedRequestError.code,
      message,
    });
    expect(params.openSigningErrorModal).toHaveBeenCalledWith(message);
  });

  it('rethrows unknown wallet errors as is', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { provider, params } = setupFailing(0);

    await expect(provider.request(SIGN_REQUEST)).rejects.toBe(walletError);
    expect(params.openSigningErrorModal).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// on — connector events
// ---------------------------------------------------------------------------
describe('on — connector events', () => {
  it('accountsChanged forwards accounts from connector change', () => {
    const { provider, connector } = setup();
    const handler = vi.fn();
    provider.on('accountsChanged', handler);

    connector.emit('change', { accounts: [SIGNER] });
    connector.emit('change', { chainId: 1 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith([SIGNER]);
  });

  it('chainChanged forwards hex chain id from connector change', () => {
    const { provider, connector } = setup();
    const handler = vi.fn();
    provider.on('chainChanged', handler);

    connector.emit('change', { accounts: [SIGNER] });
    connector.emit('change', { chainId: 11155111 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('0xaa36a7');
  });

  it('connect emits current chain id in next tick', () => {
    vi.useFakeTimers();
    const { provider } = setup();
    const handler = vi.fn();
    provider.on('connect', handler);

    expect(handler).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(handler).toHaveBeenCalledWith({ chainId: '0x1' });
    vi.useRealTimers();
  });

  it.each(['disconnect', 'close'])(
    '%s forwards connector disconnect',
    (event) => {
      const { provider, connector } = setup();
      const handler = vi.fn();
      provider.on(event, handler);

      const error = new Error('gone');
      connector.emit('disconnect', error);

      expect(handler).toHaveBeenCalledWith(error);
    },
  );

  it('registers cleanup that unsubscribes connector handler', () => {
    const { provider, connector, cleanups } = setup();
    const handler = vi.fn();
    provider.on('accountsChanged', handler);

    expect(cleanups).toHaveLength(1);
    cleanups[0]();
    connector.emit('change', { accounts: [SIGNER] });

    expect(connector.emitter.off).toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores unknown events', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { provider, connector, cleanups } = setup();
    provider.on('message', vi.fn());

    expect(connector.emitter.on).not.toHaveBeenCalled();
    expect(cleanups).toHaveLength(0);
    expect(consoleWarn).toHaveBeenCalled();
    consoleWarn.mockRestore();
  });
});
