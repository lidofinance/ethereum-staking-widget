import { prefixUrl } from '../get-ipfs-base-path';

vi.mock('config', () => ({ config: { ipfsMode: true } }));

describe('prefixUrl in IPFS mode', () => {
  beforeAll(() => {
    vi.stubGlobal('document', {
      querySelector: () => ({ href: 'https://gateway.test/ipfs/cid/' }),
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('puts the hash path after the base path', () => {
    expect(prefixUrl('/wrap')).toBe('https://gateway.test/ipfs/cid/#/wrap');
  });

  it('encodes query values once', () => {
    expect(prefixUrl('/wrap', { product: 'stake,swap', ref: 'a b' })).toBe(
      'https://gateway.test/ipfs/cid/?product=stake%2Cswap&ref=a+b#/wrap',
    );
  });
});
