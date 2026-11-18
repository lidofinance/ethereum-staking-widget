import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProviderDisconnectedError, type Address } from 'viem';

import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));

vi.mock('wagmi', () => ({
  useWalletClient: vi.fn(),
  useConnection: vi.fn(),
}));

vi.mock('modules/web3', () => ({
  useDappStatus: vi.fn(),
  useIsLedgerLive: () => false,
}));

const validateAddress = vi.fn();
vi.mock('providers/address-validation-provider', () => ({
  useAddressValidation: () => ({ validateAddress }),
}));

vi.mock('../../guards/tx', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../guards/tx')>()),
  validateRpcRequest: vi.fn(),
}));

import { useConnection, useWalletClient } from 'wagmi';
import { useDappStatus } from 'modules/web3';

import { validateRpcRequest } from '../../guards/tx';
import { MAINNET_TX_CONFIG } from '../../guards/tx/__tests__/fixtures';
import type { CowSwapSession } from '../../guards/trade';
import { createCowSwapSession } from '../../guards/trade/utils';
import { useCowSwapEthereumProvider } from '../use-cow-swap-ethereum-provider';

const ACCOUNT_A = '0x00000000000000000000000000000000000000a1' as Address;
const ACCOUNT_B = '0x00000000000000000000000000000000000000b2' as Address;

const makeWalletClient = (address: Address) => ({
  account: { address },
  chain: { id: 1 },
  request: vi.fn().mockResolvedValue('0xsigned'),
  getChainId: vi.fn().mockResolvedValue(1),
  getAddresses: vi.fn().mockResolvedValue([address]),
});

const CONNECTOR = { emitter: { on: vi.fn(), off: vi.fn() } };

// one live session at a time, like the trade guard's
let currentSession: CowSwapSession | undefined;
const startSession = vi.fn((): CowSwapSession => {
  currentSession?.revoke();
  currentSession = createCowSwapSession({});
  return currentSession;
});

const OPTIONS = {
  startSession,
  openTransactionGuardModal: () => Promise.resolve(),
  openSigningErrorModal: () => Promise.resolve(),
  getNetworkTxConfig: () => MAINNET_TX_CONFIG,
  appCode: 'Test App',
};

type WalletState = {
  address?: Address;
  walletChainId?: number;
  walletClient?: ReturnType<typeof makeWalletClient>;
};

// a render with the given wallet state; the module keeps the cleanup set between renders
const render = ({ address, walletChainId = 1, walletClient }: WalletState) => {
  vi.mocked(useDappStatus).mockReturnValue({
    address,
    chainId: 1,
    walletChainId,
  } as never);
  vi.mocked(useWalletClient).mockReturnValue({ data: walletClient } as never);
  vi.mocked(useConnection).mockReturnValue({ connector: CONNECTOR } as never);
  return renderHook(() => useCowSwapEthereumProvider(OPTIONS));
};

const SIGN_REQUEST = {
  id: 1,
  method: 'eth_signTypedData_v4',
  params: [ACCOUNT_A, '{}'],
};

beforeEach(() => {
  vi.clearAllMocks();
  validateAddress.mockResolvedValue(true);
  vi.mocked(validateRpcRequest).mockImplementation(
    async (payload) =>
      ({ order: undefined, approvals: [], sanitizedRequest: payload }) as never,
  );
});

describe('useCowSwapEthereumProvider: wallet client account', () => {
  it('binds the wallet client query to the connected account', () => {
    render({ address: ACCOUNT_A, walletClient: makeWalletClient(ACCOUNT_A) });

    expect(useWalletClient).toHaveBeenCalledWith({ account: ACCOUNT_A });
  });

  it('waits while the client belongs to another account', () => {
    const result = render({
      address: ACCOUNT_B,
      walletClient: makeWalletClient(ACCOUNT_A),
    });

    expect(result).toEqual({ provider: undefined, isProviderPending: true });
  });

  it('after an account switch the old provider is ended and the new one signs', async () => {
    const clientA = makeWalletClient(ACCOUNT_A);
    const clientB = makeWalletClient(ACCOUNT_B);

    const { provider: providerA } = render({
      address: ACCOUNT_A,
      walletClient: clientA,
    });
    // the account switched, the query has not caught up yet
    render({ address: ACCOUNT_B, walletClient: clientA });
    const { provider: providerB } = render({
      address: ACCOUNT_B,
      walletClient: clientB,
    });

    await expect(providerA?.request(SIGN_REQUEST)).rejects.toMatchObject({
      code: ProviderDisconnectedError.code,
    });
    expect(clientA.request).not.toHaveBeenCalled();

    await expect(
      providerB?.request({ ...SIGN_REQUEST, params: [ACCOUNT_B, '{}'] }),
    ).resolves.toBe('0xsigned');
    expect(clientB.request).toHaveBeenCalledTimes(1);
  });
});

describe('useCowSwapEthereumProvider: session', () => {
  it('a request validating when its provider is dropped never reaches the wallet', async () => {
    let resolveValidation!: (value: unknown) => void;
    vi.mocked(validateRpcRequest).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveValidation = resolve;
      }) as never,
    );
    const client = makeWalletClient(ACCOUNT_A);
    const { provider } = render({ address: ACCOUNT_A, walletClient: client });

    const pending = provider?.request(SIGN_REQUEST);
    // the wallet left the dapp chain: no provider replaces this one
    const next = render({
      address: ACCOUNT_A,
      walletChainId: 8453,
      walletClient: client,
    });
    resolveValidation({
      order: undefined,
      approvals: [],
      sanitizedRequest: SIGN_REQUEST,
    });

    expect(next.provider).toBeUndefined();
    await expect(pending).rejects.toMatchObject({
      code: ProviderDisconnectedError.code,
    });
    expect(client.request).not.toHaveBeenCalled();
  });

  it('a signature is checked once, for the account the client signs with', async () => {
    const client = makeWalletClient(ACCOUNT_A);
    const { provider } = render({ address: ACCOUNT_A, walletClient: client });

    await expect(provider?.request(SIGN_REQUEST)).resolves.toBe('0xsigned');
    expect(validateAddress).toHaveBeenCalledTimes(1);
    expect(validateAddress).toHaveBeenCalledWith(ACCOUNT_A);
  });

  it('starts one session per provider', () => {
    const client = makeWalletClient(ACCOUNT_A);
    render({ address: ACCOUNT_A, walletClient: client });
    render({ address: ACCOUNT_B, walletClient: client });

    expect(startSession).toHaveBeenCalledTimes(1);
  });
});
