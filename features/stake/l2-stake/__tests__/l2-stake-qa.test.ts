const qa = vi.hoisted(() => ({ enabled: true }));
vi.mock('config', () => ({
  config: {
    get enableQaHelpers() {
      return qa.enabled;
    },
  },
}));

import { getMockedL2StakeMode } from '../hooks/l2-stake-qa';

const KEY = 'mock-qa-helpers-l2-stake-mode';
const store = new Map<string, string>();

beforeAll(() => {
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
});
afterAll(() => {
  vi.unstubAllGlobals();
});
beforeEach(() => {
  store.clear();
  qa.enabled = true;
});

describe('getMockedL2StakeMode', () => {
  it('returns nothing when no mode is pinned', () => {
    expect(getMockedL2StakeMode()).toBeNull();
  });

  it.each(['all', 'fastLaneOnly', 'slowLaneOnly'])(
    'returns the pinned mode %s',
    (mode) => {
      store.set(KEY, mode);
      expect(getMockedL2StakeMode()).toBe(mode);
    },
  );

  it('ignores a value that is not a mode', () => {
    store.set(KEY, 'bothLanes');
    expect(getMockedL2StakeMode()).toBeNull();
  });

  it('ignores the pin without the helpers', () => {
    store.set(KEY, 'slowLaneOnly');
    qa.enabled = false;
    expect(getMockedL2StakeMode()).toBeNull();
  });
});
