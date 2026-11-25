const state = vi.hoisted(() => {
  // set before each test
  const query: Record<string, string> = {};
  return { query, replace: vi.fn(() => Promise.resolve(true)) };
});

vi.mock('next/router', () => ({
  useRouter: () => ({
    isReady: true,
    query: state.query,
    pathname: '/earn/eth/deposit',
    replace: state.replace,
  }),
}));

// No DOM runs in unit tests: the effect is applied on the hook call
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useEffect: (effect: () => void) => effect(),
}));

import { useQueryParamsTokenForm } from '../use-query-values-form';

type FormValues = { token: 'ETH' | 'wstETH' };

const TOKENS = { eth: 'ETH', wsteth: 'wstETH' } as const;

const useAppliedQuery = (token: string) => {
  state.query = { token, ref: 'x' };
  const setValue = vi.fn();
  useQueryParamsTokenForm<FormValues>({ setValue, tokens: TOKENS });
  return setValue;
};

describe('useQueryParamsTokenForm', () => {
  beforeEach(() => {
    state.replace.mockClear();
  });

  it('selects a known token, case-insensitively', () => {
    expect(useAppliedQuery('wstETH')).toHaveBeenCalledWith('token', 'wstETH');
    expect(useAppliedQuery('ETH')).toHaveBeenCalledWith('token', 'ETH');
  });

  it('ignores an unknown token', () => {
    expect(useAppliedQuery('usdc')).not.toHaveBeenCalled();
  });

  // The key is lowercased first, so only all-lowercase inherited names reach it
  it.each(['constructor', 'Constructor', '__proto__'])(
    'ignores the inherited key %s',
    (token) => {
      expect(useAppliedQuery(token)).not.toHaveBeenCalled();
    },
  );

  it('drops the param from the URL either way', () => {
    useAppliedQuery('constructor');
    expect(state.replace).toHaveBeenCalledWith(
      { pathname: '/earn/eth/deposit', query: { ref: 'x' } },
      undefined,
      { shallow: true, scroll: false },
    );
  });
});
