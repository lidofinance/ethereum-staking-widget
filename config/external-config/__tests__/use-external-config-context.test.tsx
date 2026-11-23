import { renderToStaticMarkup } from 'react-dom/server';

import { useExternalConfigContext } from '../use-external-config-context';
import { getLocalFallbackManifest } from '../utils';
import { parseProductsUrlState } from '../products';
import type { ExternalConfig } from '../types';

const state = vi.hoisted(() => ({
  ipfsMode: false,
  appFlag: undefined as string | undefined,
  earnDisabled: false,
  pages: {},
}));

vi.mock('config', () => ({
  config: {
    get ipfsMode() {
      return state.ipfsMode;
    },
    defaultChain: 1,
    useConfigManifestFile: true,
  },
}));

vi.mock('providers/app-flag', () => ({ useAppFlag: () => state.appFlag }));

vi.mock('features/earn/shared/hooks/use-earn-state', () => ({
  useEarnRuntimeState: () => ({
    isEarnDisabledByRuntimeContext: state.earnDisabled,
  }),
}));

vi.mock('../use-products-url-state', () => ({
  useProductsUrlState: () => parseProductsUrlState([]),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => {
    const entry = getLocalFallbackManifest()['1'];
    return {
      data: {
        ...entry,
        config: {
          ...entry?.config,
          pages: state.pages,
        },
      },
    };
  },
}));

const render = (): ExternalConfig => {
  let result: ExternalConfig | undefined;
  const Probe = () => {
    result = useExternalConfigContext(undefined);
    return null;
  };
  renderToStaticMarkup(<Probe />);
  return result as ExternalConfig;
};

describe('useExternalConfigContext page overrides', () => {
  beforeEach(() => {
    state.ipfsMode = false;
    state.appFlag = undefined;
    state.earnDisabled = false;
    state.pages = { '/portfolio': { shouldDisable: false } };
  });

  it('disables /portfolio in IPFS mode', () => {
    state.ipfsMode = true;
    expect(render().pages?.['/portfolio']?.shouldDisable).toBe(true);
  });

  it('disables /portfolio in Ledger Live', () => {
    state.appFlag = 'ledger-live';
    expect(render().pages?.['/portfolio']?.shouldDisable).toBe(true);
  });

  it('keeps /portfolio enabled when the manifest enables it', () => {
    expect(render().pages?.['/portfolio']?.shouldDisable).toBe(false);
  });

  it('keeps /portfolio disabled when the manifest disables it', () => {
    state.pages = { '/portfolio': { shouldDisable: true } };
    expect(render().pages?.['/portfolio']?.shouldDisable).toBe(true);
  });

  it('keeps other manifest pages untouched by the portfolio override', () => {
    state.ipfsMode = true;
    state.pages = { '/wrap': { shouldDisable: false } };
    expect(render().pages?.['/wrap']?.shouldDisable).toBe(false);
  });

  it('disables Swap but not Earn in Ledger Live', () => {
    state.appFlag = 'ledger-live';
    const { pages } = render();
    expect(pages?.['/swap']?.shouldDisable).toBe(true);
    expect(pages?.['/earn']?.shouldDisable).not.toBe(true);
  });

  it('disables Earn by runtime context without touching Swap', () => {
    state.earnDisabled = true;
    const { pages } = render();
    expect(pages?.['/earn']?.shouldDisable).toBe(true);
    expect(pages?.['/swap']?.shouldDisable).not.toBe(true);
  });

  it('disables both Earn and Swap in IPFS mode', () => {
    state.ipfsMode = true;
    const { pages } = render();
    expect(pages?.['/earn']?.shouldDisable).toBe(true);
    expect(pages?.['/swap']?.shouldDisable).toBe(true);
  });
});
