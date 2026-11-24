import {
  ClientLimitError,
  createClientLimiter,
  getClientKey,
  getNetworkKey,
  type ClientLimitName,
} from '../client-limit';

const LIMITS = { addresses: 2, positions: 3, history: 2, rewards: 1 };
const IP = '203.0.113.7';

const limitOf = (run: () => void): ClientLimitName | null => {
  try {
    run();
    return null;
  } catch (error) {
    if (error instanceof ClientLimitError) return error.limit;
    throw error;
  }
};

describe('getClientKey', () => {
  it('keeps an IPv4 address as is', () => {
    expect(getClientKey(IP)).toBe(IP);
  });

  it.each([
    ['2001:db8:1:2:aaaa:bbbb:cccc:dddd', '2001:db8:1:2::/64'],
    ['2001:db8:1:2::1', '2001:db8:1:2::/64'],
    ['2001:0db8:0001:0002::1', '2001:db8:1:2::/64'],
    ['2001:db8::1', '2001:db8:0:0::/64'],
    ['::1', '0:0:0:0::/64'],
    ['2001:DB8:1:2::1', '2001:db8:1:2::/64'],
    ['64:ff9b::192.0.2.1', '64:ff9b:0:0::/64'],
  ])('cuts %s to its /64', (ip, key) => {
    expect(getClientKey(ip)).toBe(key);
  });
});

describe('getNetworkKey', () => {
  it('cuts an IPv6 address to its /48', () => {
    expect(getNetworkKey('2001:db8:1:2::1')).toBe('2001:db8:1::/48');
    expect(getNetworkKey('2001:db8:1:ffff::1')).toBe('2001:db8:1::/48');
  });

  it('has no wider key for IPv4', () => {
    expect(getNetworkKey(IP)).toBeNull();
  });
});

describe('createClientLimiter', () => {
  it('caps one IPv6 /48 across its /64 networks', () => {
    const limiter = createClientLimiter({
      limits: { addresses: 1, positions: 1, history: 1, rewards: 1 },
    });
    const countRequestFrom = (index: number) => () =>
      limiter.countRequest(
        `2001:db8:1:${index.toString(16)}::1`,
        `0x${index}`,
        'positions',
        true,
      );
    // every /64 is a new client, the /48 holds 16 times one client's limit
    for (let index = 0; index < 16; index += 1) {
      expect(limitOf(countRequestFrom(index))).toBeNull();
    }
    expect(limitOf(countRequestFrom(16))).toBe('addresses');
    // another /48 is not affected
    expect(
      limitOf(() =>
        limiter.countRequest('2001:db8:2::1', '0xa', 'positions', true),
      ),
    ).toBeNull();
  });

  it('takes the call back from the network counter too', () => {
    const limiter = createClientLimiter({
      limits: { addresses: 100, positions: 1, history: 1, rewards: 1 },
    });
    const uncountCalls = Array.from({ length: 16 }, (_, index) =>
      limiter.countRequest(
        `2001:db8:1:${index.toString(16)}::1`,
        '0xa',
        'positions',
        true,
      ),
    );
    const next = () =>
      limiter.countRequest('2001:db8:1:ff::1', '0xa', 'positions', true);
    expect(limitOf(next)).toBe('positions');
    uncountCalls[0]();
    expect(limitOf(next)).toBeNull();
  });

  it('stops a new wallet over the address limit, keeps known ones', () => {
    const limiter = createClientLimiter({ limits: LIMITS });
    limiter.countRequest(IP, '0xa', 'positions', false);
    limiter.countRequest(IP, '0xb', 'positions', false);
    expect(
      limitOf(() => limiter.countRequest(IP, '0xc', 'positions', false)),
    ).toBe('addresses');
    expect(
      limitOf(() => limiter.countRequest(IP, '0xa', 'positions', false)),
    ).toBe(null);
  });

  it('counts the same wallet once across scopes', () => {
    const limiter = createClientLimiter({ limits: LIMITS });
    limiter.countRequest(IP, '0xa', 'positions', false);
    limiter.countRequest(IP, '0xa', 'rewards', false);
    limiter.countRequest(IP, '0xa', 'history', false);
    expect(
      limitOf(() => limiter.countRequest(IP, '0xb', 'positions', false)),
    ).toBe(null);
  });

  it('caps upstream calls per scope, cached answers are not counted', () => {
    const limiter = createClientLimiter({ limits: LIMITS });
    limiter.countRequest(IP, '0xa', 'history', true);
    limiter.countRequest(IP, '0xa', 'history', true);
    expect(
      limitOf(() => limiter.countRequest(IP, '0xa', 'history', true)),
    ).toBe('history');
    // another scope has its own count, and a cached answer costs nothing
    expect(
      limitOf(() => limiter.countRequest(IP, '0xa', 'positions', true)),
    ).toBe(null);
    expect(
      limitOf(() => limiter.countRequest(IP, '0xa', 'history', false)),
    ).toBe(null);
  });

  it('spends nothing on a rejected request', () => {
    const limiter = createClientLimiter({ limits: LIMITS });
    limiter.countRequest(IP, '0xa', 'rewards', true);
    // over the rewards limit with a new wallet: the wallet is not recorded
    expect(
      limitOf(() => limiter.countRequest(IP, '0xb', 'rewards', true)),
    ).toBe('rewards');
    limiter.countRequest(IP, '0xc', 'positions', false);
    expect(
      limitOf(() => limiter.countRequest(IP, '0xb', 'positions', false)),
    ).toBe('addresses');
  });

  it('counts clients apart, and one IPv6 /64 as one client', () => {
    const limiter = createClientLimiter({ limits: LIMITS });
    limiter.countRequest('2001:db8:1:2::1', '0xa', 'rewards', true);
    expect(
      limitOf(() =>
        limiter.countRequest('2001:db8:1:2:ffff::9', '0xa', 'rewards', true),
      ),
    ).toBe('rewards');
    expect(
      limitOf(() =>
        limiter.countRequest('2001:db8:1:3::1', '0xa', 'rewards', true),
      ),
    ).toBe(null);
    expect(
      limitOf(() => limiter.countRequest(IP, '0xa', 'rewards', true)),
    ).toBe(null);
  });

  it('starts over when the window ends and tells when', () => {
    let time = 1_000_000;
    const limiter = createClientLimiter({
      limits: LIMITS,
      windowMs: 60_000,
      now: () => time,
    });
    limiter.countRequest(IP, '0xa', 'rewards', true);
    time += 45_000;
    try {
      limiter.countRequest(IP, '0xa', 'rewards', true);
      throw new Error('expected a limit');
    } catch (error) {
      expect(error).toBeInstanceOf(ClientLimitError);
      expect((error as ClientLimitError).retryAfterSec).toBe(15);
    }
    time += 15_000;
    expect(
      limitOf(() => limiter.countRequest(IP, '0xa', 'rewards', true)),
    ).toBe(null);
  });

  it('does not limit a request without a client IP', () => {
    const limiter = createClientLimiter({ limits: LIMITS });
    for (let index = 0; index < 10; index += 1) {
      limiter.countRequest(undefined, `0x${index}`, 'rewards', true);
    }
  });

  it('reports each rejection', () => {
    const onLimit = vi.fn();
    const limiter = createClientLimiter({ limits: LIMITS, onLimit });
    limiter.countRequest(IP, '0xa', 'rewards', true);
    limitOf(() => limiter.countRequest(IP, '0xa', 'rewards', true));
    expect(onLimit).toHaveBeenCalledExactlyOnceWith('rewards');
  });

  it('forgets the least recent client over the client cap', () => {
    const limiter = createClientLimiter({ limits: LIMITS, maxClients: 2 });
    limiter.countRequest('198.51.100.1', '0xa', 'rewards', true);
    limiter.countRequest('198.51.100.2', '0xa', 'rewards', true);
    limiter.countRequest('198.51.100.3', '0xa', 'rewards', true);
    expect(
      limitOf(() =>
        limiter.countRequest('198.51.100.1', '0xa', 'rewards', true),
      ),
    ).toBe(null);
  });

  it('gives an upstream call back when uncounted, once', () => {
    const limiter = createClientLimiter({ limits: LIMITS });
    const uncountUpstreamCall = limiter.countRequest(
      IP,
      '0xa',
      'rewards',
      true,
    );
    uncountUpstreamCall();
    uncountUpstreamCall();
    limiter.countRequest(IP, '0xa', 'rewards', true);
    expect(
      limitOf(() => limiter.countRequest(IP, '0xa', 'rewards', true)),
    ).toBe('rewards');
  });

  it('keeps the wallet counted after its call is uncounted', () => {
    const limiter = createClientLimiter({
      limits: { ...LIMITS, addresses: 1 },
    });
    limiter.countRequest(IP, '0xa', 'positions', true)();
    expect(
      limitOf(() => limiter.countRequest(IP, '0xb', 'positions', false)),
    ).toBe('addresses');
  });
});
