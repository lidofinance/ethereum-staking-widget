import { renderToStaticMarkup } from 'react-dom/server';

const state = vi.hoisted(() => ({
  path: '/withdrawals/request',
  pages: undefined as Record<string, unknown> | undefined,
  navigate: vi.fn(),
  search: '',
  productQuery: {},
  // the effect the provider hands to LayoutEffectSsrDelayed
  effect: undefined as (() => void) | undefined,
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => state.navigate,
  useSearchParams: () => [new URLSearchParams(state.search)],
}));
vi.mock('shared/hooks/use-router-path', () => ({
  useRouterPath: () => state.path,
}));
vi.mock('config', () => ({
  useConfig: () => ({ externalConfig: { pages: state.pages } }),
}));
vi.mock('config/external-config', () => ({
  isDisabledPath: (path: string, pages: Record<string, unknown>) =>
    Object.keys(pages).some((prefix) => path.startsWith(prefix)),
}));
vi.mock('config/external-config/products', () => ({
  getHomePath: () => '/',
  // the query with the product params, as the real helper builds it
  withProductQuery: (
    query: Record<string, string>,
    productQuery: Record<string, string>,
  ) => ({ ...query, ...productQuery }),
}));
vi.mock('config/external-config/use-products-url-state', () => ({
  useProductQuery: () => state.productQuery,
  useProductsUrlState: () => ({}),
}));
vi.mock('shared/components/layout-effect-ssr-delayed', () => ({
  LayoutEffectSsrDelayed: ({ effect }: { effect: () => void }) => {
    state.effect = effect;
    return null;
  },
}));

import { ExternalForbiddenRouteProvider } from './external-forbidden-route';

const render = () =>
  renderToStaticMarkup(
    <ExternalForbiddenRouteProvider>
      <form>withdrawal form</form>
    </ExternalForbiddenRouteProvider>,
  );

describe('ExternalForbiddenRouteProvider', () => {
  beforeEach(() => {
    state.path = '/withdrawals/request';
    state.pages = undefined;
    state.search = '';
    state.productQuery = {};
    state.effect = undefined;
    state.navigate.mockClear();
  });

  it('renders the page when the path is enabled', () => {
    state.pages = { '/wrap': {} };
    expect(render()).toContain('withdrawal form');
  });

  it('renders the page while the config is not loaded', () => {
    expect(render()).toContain('withdrawal form');
  });

  // the redirect never runs in this render, as when navigation is cancelled
  it('renders no form on a disabled path without a redirect', () => {
    state.pages = { '/withdrawals': {} };
    expect(render()).not.toContain('withdrawal form');
    expect(state.navigate).not.toHaveBeenCalled();
  });

  describe('redirect from a disabled path', () => {
    it('redirects home keeping the query and the product params', () => {
      state.pages = { '/withdrawals': {} };
      state.search = 'ref=0xabc';
      state.productQuery = { swap: 'disabled' };
      render();
      state.effect?.();

      expect(state.navigate).toHaveBeenCalledWith({
        pathname: '/',
        search: 'ref=0xabc&swap=disabled',
      });
    });

    it('does not redirect from an enabled path', () => {
      state.pages = { '/wrap': {} };
      render();
      state.effect?.();

      expect(state.navigate).not.toHaveBeenCalled();
    });
  });
});
