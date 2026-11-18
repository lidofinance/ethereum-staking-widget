import { renderToStaticMarkup } from 'react-dom/server';

const state = vi.hoisted(() => ({
  path: '/withdrawals/request',
  pages: undefined as Record<string, unknown> | undefined,
  push: vi.fn(),
  query: {},
  productQuery: {},
  // the effect and deps the provider hands to LayoutEffectSsrDelayed
  effect: undefined as (() => void) | undefined,
  waitForNextRouter: undefined as boolean | undefined,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: state.push,
    pathname: state.path,
    query: state.query,
  }),
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
  // the router query with the product params, as the real helper builds it
  getRedirectQuery: (
    _pathname: string,
    query: Record<string, string>,
    productQuery: Record<string, string>,
  ) => ({ ...query, ...productQuery }),
}));
vi.mock('config/external-config/use-products-url-state', () => ({
  useProductQuery: () => state.productQuery,
  useProductsUrlState: () => ({}),
}));
vi.mock('shared/components/layout-effect-ssr-delayed', () => ({
  LayoutEffectSsrDelayed: ({
    effect,
    waitForNextRouter,
  }: {
    effect: () => void;
    waitForNextRouter?: boolean;
  }) => {
    state.effect = effect;
    state.waitForNextRouter = waitForNextRouter;
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
    state.query = {};
    state.productQuery = {};
    state.effect = undefined;
    state.waitForNextRouter = undefined;
    state.push.mockClear();
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
    expect(state.push).not.toHaveBeenCalled();
  });

  describe('redirect from a disabled path', () => {
    // on a direct load the router query and the URL product params are empty
    // until the router is ready
    it('runs the redirect only once the Next router is ready', () => {
      state.pages = { '/withdrawals': {} };
      render();

      expect(state.waitForNextRouter).toBe(true);
    });

    it('redirects home keeping the query and the product params', () => {
      state.pages = { '/withdrawals': {} };
      state.query = { ref: '0xabc' };
      state.productQuery = { swap: 'disabled' };
      render();
      state.effect?.();

      expect(state.push).toHaveBeenCalledWith({
        pathname: '/',
        query: { ref: '0xabc', swap: 'disabled' },
      });
    });

    it('does not redirect from an enabled path', () => {
      state.pages = { '/wrap': {} };
      render();
      state.effect?.();

      expect(state.push).not.toHaveBeenCalled();
    });
  });
});
