import type { ReactElement } from 'react';

const state = vi.hoisted(() => ({
  isSsr: false,
  // set before each test
  router: null as { isReady: boolean } | null,
}));

vi.mock('shared/hooks/useSsrMode', () => ({ useSsrMode: () => state.isSsr }));
vi.mock('next/router', () => ({ useRouter: () => state.router }));

import { LayoutEffectSsrDelayed } from '../layout-effect-ssr-delayed';

const effect = vi.fn();
const deps = ['a'];

// No DOM runs in unit tests: the component is checked by what it renders,
// the effect applier (an element) or nothing
const renders = (waitForNextRouter?: boolean) =>
  LayoutEffectSsrDelayed({ effect, deps, waitForNextRouter }) as ReactElement<{
    effect: unknown;
    deps: unknown;
  }> | null;

describe('LayoutEffectSsrDelayed', () => {
  beforeEach(() => {
    state.isSsr = false;
    state.router = { isReady: true };
  });

  it('applies nothing during the server render', () => {
    state.isSsr = true;
    expect(renders()).toBeNull();
    expect(renders(true)).toBeNull();
  });

  it('applies the effect on the client, ready router or not, by default', () => {
    state.router = { isReady: false };
    expect(renders()?.props).toMatchObject({ effect, deps });
  });

  it('waits for the Next router when asked to', () => {
    state.router = { isReady: false };
    expect(renders(true)).toBeNull();
  });

  it('applies the effect once the router is ready', () => {
    expect(renders(true)?.props).toMatchObject({ effect, deps });
  });

  it('waits when there is no router at all', () => {
    state.router = null;
    expect(renders(true)).toBeNull();
    expect(renders()?.props).toMatchObject({ effect, deps });
  });
});
