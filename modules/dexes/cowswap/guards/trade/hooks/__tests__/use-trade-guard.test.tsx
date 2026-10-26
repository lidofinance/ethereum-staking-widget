import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ethAddress, InvalidRequestRpcError, type Address } from 'viem';

import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));

// no RPC: the oracle is not reached once the trade evaluation is mocked
vi.mock('../../../oracles', () => ({
  useOracleRates: () => ({
    verifyWithOracle: vi.fn(),
    readSellTokenUsd: vi.fn(),
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
  const provider = createCowSwapProvider({
    walletClient,
    connector: { emitter: { on: vi.fn(), off: vi.fn() } },
    chainId: 1,
    isLedgerLive: false,
    networkTxConfig: MAINNET_TX_CONFIG,
    appCode: 'Test App',
    consumeSignedOrder: guard.consumeSignedOrder,
    verifyApproval: guard.verifyApproval,
    openTransactionGuardModal,
    openSigningErrorModal: vi.fn().mockResolvedValue(undefined),
    addCleanup: () => {},
  } as never);
  return { guard, provider, walletClient, openTransactionGuardModal };
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
