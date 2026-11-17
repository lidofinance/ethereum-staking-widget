import { renderToStaticMarkup } from 'react-dom/server';

const state = vi.hoisted(() => ({
  path: '/withdrawals/request',
  pages: undefined as Record<string, unknown> | undefined,
  push: vi.fn(),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ push: state.push, pathname: state.path, query: {} }),
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
  getRedirectQuery: () => ({}),
}));
vi.mock('config/external-config/use-products-url-state', () => ({
  useProductQuery: () => undefined,
  useProductsUrlState: () => ({}),
}));
vi.mock('shared/components/layout-effect-ssr-delayed', () => ({
  LayoutEffectSsrDelayed: () => null,
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
});
