import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProviderDisconnectedError, type Address } from 'viem';

import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

// the server render runs no effects: each instance's unmount cleanup is kept
// here, so a test can unmount a frame at the point React would
const unmountCleanups: (() => void)[] = [];
// the server render keeps no state either: refs are kept per frame here, so
// consecutive renders of one frame act as its re-renders
let frameRefs: { current: unknown }[] = [];
let refIndex = 0;
const startFrame = () => {
  frameRefs = [];
  refIndex = 0;
};
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => {
      const dispose = effect();
      if (dispose) unmountCleanups.push(dispose);
    },
    useRef: (initial: unknown) =>
      (frameRefs[refIndex++] ??= { current: initial }),
  };
});

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

// a re-render of the test's frame with the given wallet state
const render = (state: WalletState) => {
  const { address, walletClient } = state;
  // undefined when given means a disconnected wallet
  const walletChainId = 'walletChainId' in state ? state.walletChainId : 1;
  refIndex = 0;
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
  startFrame();
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

  it('does not wait without a connected wallet, so the widget still renders', () => {
    const result = render({ address: undefined, walletChainId: undefined });

    expect(result).toEqual({ provider: undefined, isProviderPending: false });
    expect(startSession).not.toHaveBeenCalled();
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

describe('useCowSwapEthereumProvider: route switch between integrations', () => {
  // each integration's frame has its own trade guard and appCode
  const frameOptions = (appCode: string) => {
    let current: CowSwapSession | undefined;
    return {
      ...OPTIONS,
      appCode,
      startSession: () => {
        current?.revoke();
        current = createCowSwapSession({});
        return current;
      },
    };
  };

  const renderFrame = (
    appCode: string,
    walletClient: ReturnType<typeof makeWalletClient>,
  ) => {
    vi.mocked(useDappStatus).mockReturnValue({
      address: ACCOUNT_A,
      chainId: 1,
      walletChainId: 1,
    } as never);
    vi.mocked(useWalletClient).mockReturnValue({ data: walletClient } as never);
    vi.mocked(useConnection).mockReturnValue({ connector: CONNECTOR } as never);
    startFrame();
    const before = unmountCleanups.length;
    const result = renderHook(() =>
      useCowSwapEthereumProvider(frameOptions(appCode)),
    );
    return { ...result, unmount: unmountCleanups[before] };
  };

  it('the frame of the next route keeps signing after the previous route unmounts its frame', async () => {
    const client = makeWalletClient(ACCOUNT_A);
    const withdrawals = renderFrame('Withdrawals App', client);
    // React renders the next page's frame first, then unmounts the previous one
    const swap = renderFrame('Swap App', client);
    withdrawals.unmount();

    await expect(swap.provider?.request(SIGN_REQUEST)).resolves.toBe(
      '0xsigned',
    );
    await expect(
      withdrawals.provider?.request(SIGN_REQUEST),
    ).rejects.toMatchObject({
      code: ProviderDisconnectedError.code,
    });
  });

  it('unmounting a frame ends its own provider', async () => {
    const client = makeWalletClient(ACCOUNT_A);
    const frame = renderFrame('Swap App', client);
    frame.unmount();

    await expect(frame.provider?.request(SIGN_REQUEST)).rejects.toMatchObject({
      code: ProviderDisconnectedError.code,
    });
    expect(client.request).not.toHaveBeenCalled();
  });
});
