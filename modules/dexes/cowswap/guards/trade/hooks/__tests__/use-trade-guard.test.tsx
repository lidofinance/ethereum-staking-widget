import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ethAddress,
  InvalidRequestRpcError,
  UnauthorizedProviderError,
  type Address,
} from 'viem';

import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));

// no RPC: the oracle is not reached once the trade evaluation is mocked
vi.mock('../../../oracles', () => ({
  useOracleRates: () => ({
    verifyWithOracle: vi.fn(),
    readSellTokenUsd: vi.fn(),
    readNetworkCostAllowance: vi.fn().mockResolvedValue(0),
  }),
}));

vi.mock('../../utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils')>()),
  evaluateTrade: vi.fn(),
}));

// the request parser is covered by its own tests; here it yields the ETH order
vi.mock('../../../tx', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../tx')>()),
  validateRpcRequest: vi.fn(),
}));

import { evaluateTrade, type ValidatedTradeSnapshot } from '../../utils';
import { validateRpcRequest, type OrderData } from '../../../tx';
import { MAINNET_TX_CONFIG } from '../../../tx/__tests__/fixtures';
import { createCowSwapProvider } from '../../../../utils/create-cow-swap-provider';
import type { OnTradeParamsPayload } from '../../types';
import { useTradeGuard } from '../use-trade-guard';

const SIGNER = '0x2222222222222222222222222222222222222222';
const WETH = MAINNET_TX_CONFIG.weth;
const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' as Address;
const ETH = ethAddress.toLowerCase() as Address;

const TOKEN_DECIMALS = { [ETH]: 18, [WETH.toLowerCase()]: 18, [STETH]: 18 };

// the trade evaluation sees the WETH order behind an ETH sale
const WETH_SNAPSHOT: ValidatedTradeSnapshot = {
  sellToken: WETH.toLowerCase() as Address,
  buyToken: STETH,
  sellAmountUnits: '0.1',
  buyAmountMinUnits: '0.1',
};

const ETH_ORDER = {
  sellToken: ethAddress,
  buyToken: STETH,
  sellAmount: 100000000000000000n,
  buyAmount: 100000000000000000n,
} as unknown as OrderData;

const TRADE = {
  sellToken: { address: ethAddress },
} as unknown as OnTradeParamsPayload;

const setup = () => {
  const guard = renderHook(() =>
    useTradeGuard({
      chainId: 1,
      tokenDecimals: TOKEN_DECIMALS,
      oracleFeeds: { sell: {}, buy: {} },
      quoteErrorEvent: 'swapQuoteError' as never,
      weth: WETH,
    }),
  );
  const walletClient = {
    account: { address: SIGNER },
    request: vi.fn().mockResolvedValue('0xhash'),
    getChainId: vi.fn().mockResolvedValue(1),
    getAddresses: vi.fn().mockResolvedValue([SIGNER]),
  };
  const openTransactionGuardModal = vi.fn().mockResolvedValue(undefined);
  const validateAddress = vi.fn().mockResolvedValue(true);
  // the provider of one session, as the provider hook creates it
  const createProvider = () =>
    createCowSwapProvider({
      walletClient,
      connector: { emitter: { on: vi.fn(), off: vi.fn() } },
      chainId: 1,
      isLedgerLive: false,
      networkTxConfig: MAINNET_TX_CONFIG,
      appCode: 'Test App',
      session: guard.startSession(),
      validateAddress,
      openTransactionGuardModal,
      openSigningErrorModal: vi.fn().mockResolvedValue(undefined),
      addCleanup: () => {},
    } as never);
  const provider = createProvider();
  return {
    guard,
    provider,
    createProvider,
    walletClient,
    openTransactionGuardModal,
    validateAddress,
  };
};

const deferred = <T,>() => {
  let settle!: (value: T) => void;
  const promise = new Promise<T>((resolve) => {
    settle = resolve;
  });
  return { promise, resolve: settle };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(evaluateTrade).mockResolvedValue({
    ok: true,
    snapshot: WETH_SNAPSHOT,
  });
  vi.mocked(validateRpcRequest).mockImplementation(
    async (payload) =>
      ({ order: ETH_ORDER, approvals: [], sanitizedRequest: payload }) as never,
  );
});

describe('useTradeGuard: one native ETH request per validated trade', () => {
  it.each([
    ['EthFlow transaction', 'eth_sendTransaction'],
    ['Safe funding batch', 'wallet_sendCalls'],
  ])('%s: a second request needs a fresh validation', async (_, method) => {
    const { guard, provider, walletClient, openTransactionGuardModal } =
      setup();
    const request = () => provider.request({ id: 1, method, params: [{}] });

    guard.reportTradeParams(TRADE);
    expect(await guard.validateTrade(TRADE)).toBe(true);

    await expect(request()).resolves.toBe('0xhash');
    expect(walletClient.request).toHaveBeenCalledTimes(1);

    // same validated trade: rejected before the wallet
    await expect(request()).rejects.toMatchObject({
      code: InvalidRequestRpcError.code,
    });
    expect(walletClient.request).toHaveBeenCalledTimes(1);
    expect(openTransactionGuardModal).toHaveBeenCalledTimes(1);

    expect(await guard.validateTrade(TRADE)).toBe(true);
    await expect(request()).resolves.toBe('0xhash');
    expect(walletClient.request).toHaveBeenCalledTimes(2);
  });
});

describe('useTradeGuard: address check at signing', () => {
  const send = (provider: ReturnType<typeof setup>['provider']) =>
    provider.request({ id: 1, method: 'eth_sendTransaction', params: [{}] });

  it('a validated trade from a rejected address does not reach the wallet', async () => {
    const { guard, provider, walletClient, validateAddress } = setup();
    validateAddress.mockResolvedValue(false);

    guard.reportTradeParams(TRADE);
    expect(await guard.validateTrade(TRADE)).toBe(true);

    await expect(send(provider)).rejects.toMatchObject({
      code: UnauthorizedProviderError.code,
    });
    expect(validateAddress).toHaveBeenCalledTimes(1);
    expect(walletClient.request).not.toHaveBeenCalled();
  });

  it('a validated trade from an allowed address reaches the wallet after one check', async () => {
    const { guard, provider, walletClient, validateAddress } = setup();

    guard.reportTradeParams(TRADE);
    expect(await guard.validateTrade(TRADE)).toBe(true);
    expect(validateAddress).not.toHaveBeenCalled();

    await expect(send(provider)).resolves.toBe('0xhash');
    expect(validateAddress).toHaveBeenCalledTimes(1);
    expect(walletClient.request).toHaveBeenCalledTimes(1);
  });
});

describe('useTradeGuard: sessions', () => {
  const send = (provider: ReturnType<typeof setup>['provider']) =>
    provider.request({ id: 1, method: 'eth_sendTransaction', params: [{}] });

  it('a trade validation that completes after its session ended stores nothing', async () => {
    const { guard, createProvider, walletClient } = setup();
    const evaluation = deferred<Awaited<ReturnType<typeof evaluateTrade>>>();
    vi.mocked(evaluateTrade).mockReturnValueOnce(evaluation.promise);

    guard.reportTradeParams(TRADE);
    const late = guard.validateTrade(TRADE);
    // the widget is replaced while the trade check is pending
    const nextProvider = createProvider();
    evaluation.resolve({ ok: true, snapshot: WETH_SNAPSHOT });

    expect(await late).toBe(false);
    await expect(send(nextProvider)).rejects.toMatchObject({
      code: InvalidRequestRpcError.code,
    });
    expect(walletClient.request).not.toHaveBeenCalled();
  });

  it('a revoked session drops its validated trade', async () => {
    const { guard } = setup();
    const session = guard.startSession();

    guard.reportTradeParams(TRADE);
    expect(await guard.validateTrade(TRADE)).toBe(true);
    session.revoke();

    expect(session.isActive()).toBe(false);
    expect(session.consumeSignedOrder(ETH_ORDER)).not.toBeNull();
  });

  it('starting a session revokes the previous one', async () => {
    const { guard } = setup();
    const previous = guard.startSession();

    guard.reportTradeParams(TRADE);
    expect(await guard.validateTrade(TRADE)).toBe(true);
    const current = guard.startSession();

    expect(previous.isActive()).toBe(false);
    expect(previous.consumeSignedOrder(ETH_ORDER)).not.toBeNull();
    expect(current.isActive()).toBe(true);
  });

  it('revoking an already replaced session leaves the current one intact', async () => {
    const { guard } = setup();
    const previous = guard.startSession();
    const current = guard.startSession();

    guard.reportTradeParams(TRADE);
    expect(await guard.validateTrade(TRADE)).toBe(true);
    previous.revoke();

    expect(current.isActive()).toBe(true);
    expect(current.consumeSignedOrder(ETH_ORDER)).toBeNull();
  });

  it('the trade of the current session still signs', async () => {
    const { guard, createProvider, walletClient } = setup();
    const nextProvider = createProvider();

    guard.reportTradeParams(TRADE);
    expect(await guard.validateTrade(TRADE)).toBe(true);

    await expect(send(nextProvider)).resolves.toBe('0xhash');
    expect(walletClient.request).toHaveBeenCalledTimes(1);
  });
});
