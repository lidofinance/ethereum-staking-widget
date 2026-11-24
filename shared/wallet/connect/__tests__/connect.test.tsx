import { renderToStaticMarkup } from 'react-dom/server';

import { MATOMO_CLICK_EVENTS } from 'consts/matomo';

import { Connect } from '../connect';
import { useConnectWallet } from '../use-connect-wallet';

const state = vi.hoisted(() => ({
  allowed: true,
  connect: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock('reef-knot', () => ({
  useConnectionFlow: () => ({ startConnection: state.connect }),
}));

vi.mock('config/user-config', () => ({
  useUserConfig: () => ({ isWalletConnectionAllowed: state.allowed }),
}));

vi.mock('@lidofinance/analytics-matomo', () => ({
  trackEvent: state.trackEvent,
  wrapWithEventTrack:
    (event: unknown, fn: (...args: unknown[]) => unknown) =>
    (...args: unknown[]) => {
      const [category, action, name] = event as [string, string, string];
      state.trackEvent(category, action, name);
      return fn(...args);
    },
}));

vi.mock('@lidofinance/lido-ui', () => ({
  Button: ({ children, ...props }: Record<string, unknown>) => (
    <button {...props}>{children as string}</button>
  ),
}));

const renderHook = () => {
  let value: ReturnType<typeof useConnectWallet> | undefined;
  const Probe = () => {
    value = useConnectWallet();
    return null;
  };
  renderToStaticMarkup(<Probe />);
  return value as ReturnType<typeof useConnectWallet>;
};

describe('useConnectWallet', () => {
  beforeEach(() => {
    state.allowed = true;
    state.connect.mockReset();
    state.trackEvent.mockReset();
  });

  it('connects and tracks the matomo event when allowed', () => {
    const { handleConnect, isWalletConnectionAllowed } = renderHook();
    handleConnect();
    expect(isWalletConnectionAllowed).toBe(true);
    expect(state.connect).toHaveBeenCalledTimes(1);
    expect(state.trackEvent).toHaveBeenCalledWith(
      ...MATOMO_CLICK_EVENTS.connectWallet,
    );
  });

  it('does not connect when not allowed', () => {
    state.allowed = false;
    const { handleConnect, isWalletConnectionAllowed } = renderHook();
    handleConnect();
    expect(isWalletConnectionAllowed).toBe(false);
    expect(state.connect).not.toHaveBeenCalled();
  });
});

describe('Connect', () => {
  beforeEach(() => {
    state.allowed = true;
  });

  it('renders an enabled button when connection is allowed', () => {
    const html = renderToStaticMarkup(<Connect />);
    expect(html).toContain('data-testid="connectBtn"');
    expect(html).not.toContain('disabled');
  });

  it('renders a disabled button when connection is not allowed', () => {
    state.allowed = false;
    expect(renderToStaticMarkup(<Connect />)).toContain('disabled');
  });
});
