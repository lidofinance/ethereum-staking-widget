import { renderToStaticMarkup } from 'react-dom/server';

import { SupportL1AndL2WrapChains, useDappChain } from '../dapp-chain';

const MAINNET = 1;
const OPTIMISM = 10;

type SwitchResult = { success: boolean };

const state = vi.hoisted(() => ({
  // the setter of each useState call, in call order
  setters: [] as ReturnType<typeof vi.fn>[],
  canSwitchChain: true,
  trySwitchChain: vi.fn(async (_chainId: number): Promise<SwitchResult> => ({
    success: true,
  })),
}));

// state as plain slots: the setters record what the provider sets, which a
// server render would otherwise drop
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: (initial: unknown) => {
      const setter = vi.fn();
      state.setters.push(setter);
      return [typeof initial === 'function' ? initial() : initial, setter];
    },
  };
});

vi.mock('wagmi', () => ({
  useConnection: () => ({ chainId: MAINNET, isConnected: true }),
}));
vi.mock('config', () => ({
  config: { defaultChain: 1, supportedChains: [1, 10] },
}));
vi.mock('modules/web3/web3-provider/switch-chain', () => ({
  useSwitchChain: () => ({
    trySwitchChain: state.trySwitchChain,
    isPending: false,
    canSwitchChain: state.canSwitchChain,
  }),
}));
vi.mock('modules/web3/web3-provider/lido-sdk-l2', () => ({
  LidoSDKL2Provider: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('modules/web3/web3-provider/lido-sdk', () => ({
  LidoSDKProvider: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('providers/modal-provider', () => ({
  ModalProvider: ({ children }: React.PropsWithChildren) => children,
}));

// Renders the provider and hands out its chain change request, with the
// chain id setter cleared of the render-time wallet sync
const renderProvider = () => {
  state.setters = [];
  let requestChangeChain:
    ((chainId: number) => void | Promise<void>) | undefined;
  const Probe = () => {
    requestChangeChain = useDappChain().requestChangeChain;
    return null;
  };
  renderToStaticMarkup(
    <SupportL1AndL2WrapChains>
      <Probe />
    </SupportL1AndL2WrapChains>,
  );
  // the first useState of the provider holds the dapp chain id
  const setChainId = state.setters[0];
  setChainId.mockClear();
  return {
    requestChangeChain: requestChangeChain as (
      chainId: number,
    ) => Promise<void>,
    setChainId,
  };
};

describe('DappChain requestChangeChain', () => {
  beforeEach(() => {
    state.canSwitchChain = true;
    state.trySwitchChain.mockReset();
  });

  it('sets the chain id after a successful switch', async () => {
    state.trySwitchChain.mockResolvedValue({ success: true });
    const { requestChangeChain, setChainId } = renderProvider();

    await requestChangeChain(OPTIMISM);

    expect(state.trySwitchChain).toHaveBeenCalledWith(OPTIMISM);
    expect(setChainId).toHaveBeenCalledWith(OPTIMISM);
  });

  it('sets the chain id after a rejected or failed switch', async () => {
    state.trySwitchChain.mockResolvedValue({ success: false });
    const { requestChangeChain, setChainId } = renderProvider();

    await requestChangeChain(OPTIMISM);

    expect(state.trySwitchChain).toHaveBeenCalledWith(OPTIMISM);
    expect(setChainId).toHaveBeenCalledWith(OPTIMISM);
  });

  it('sets the chain id only after the switch settles', async () => {
    let settle: ((result: SwitchResult) => void) | undefined;
    state.trySwitchChain.mockReturnValue(
      new Promise<SwitchResult>((resolve) => (settle = resolve)),
    );
    const { requestChangeChain, setChainId } = renderProvider();

    const request = requestChangeChain(OPTIMISM);
    expect(setChainId).not.toHaveBeenCalled();
    settle?.({ success: true });
    await request;

    expect(setChainId).toHaveBeenCalledWith(OPTIMISM);
  });

  it('passes a throwing switch on and leaves the chain id as it was', async () => {
    const error = new Error('switch failed');
    state.trySwitchChain.mockRejectedValue(error);
    const { requestChangeChain, setChainId } = renderProvider();

    await expect(requestChangeChain(OPTIMISM)).rejects.toBe(error);

    expect(setChainId).not.toHaveBeenCalled();
  });

  it('sets the chain id without a switch when the wallet cannot switch', async () => {
    state.canSwitchChain = false;
    const { requestChangeChain, setChainId } = renderProvider();

    await requestChangeChain(OPTIMISM);

    expect(state.trySwitchChain).not.toHaveBeenCalled();
    expect(setChainId).toHaveBeenCalledWith(OPTIMISM);
  });
});
