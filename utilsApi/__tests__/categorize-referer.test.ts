import {
  categorizeReferer,
  REFERER_NONE,
  REFERER_INVALID,
  REFERER_UNKNOWN,
} from '../categorize-referer';

describe('categorizeReferer', () => {
  it('returns "none" for empty / undefined input', () => {
    expect(categorizeReferer(undefined)).toBe(REFERER_NONE);
    expect(categorizeReferer('')).toBe(REFERER_NONE);
  });

  it('returns "invalid" for unparseable URLs', () => {
    expect(categorizeReferer('not a url')).toBe(REFERER_INVALID);
    expect(categorizeReferer('://broken')).toBe(REFERER_INVALID);
  });

  it('returns the host as-is for production / staging hosts', () => {
    expect(categorizeReferer('https://stake.lido.fi/')).toBe('stake.lido.fi');
    expect(categorizeReferer('https://stake.lido.fi/rewards?x=1')).toBe(
      'stake.lido.fi',
    );
    expect(categorizeReferer('https://stake-hoodi.testnet.fi/')).toBe(
      'stake-hoodi.testnet.fi',
    );
    expect(categorizeReferer('https://stake-sepolia.testnet.fi/')).toBe(
      'stake-sepolia.testnet.fi',
    );
    expect(categorizeReferer('https://stake.infra-staging.org/')).toBe(
      'stake.infra-staging.org',
    );
  });

  it('returns the host as-is for known partner-embed hosts', () => {
    expect(categorizeReferer('https://live.ledger.com/discover/lido')).toBe(
      'live.ledger.com',
    );
    expect(categorizeReferer('https://app.safe.global/apps')).toBe(
      'app.safe.global',
    );
  });

  it('matches per-PR preview stand pattern', () => {
    expect(
      categorizeReferer('https://pr-123.staking-widget.lidofinance.dev/'),
    ).toBe('pr-123.staking-widget.lidofinance.dev');
  });

  it('collapses IPFS gateway hosts to "unknown" (IPFS does not call /api/*)', () => {
    expect(categorizeReferer('https://bafy.ipfs.dweb.link/')).toBe(
      REFERER_UNKNOWN,
    );
    expect(categorizeReferer('https://bafy.ipfs.cf-ipfs.com/')).toBe(
      REFERER_UNKNOWN,
    );
  });

  it('does not match arbitrary "*.ipfs.*" subdomains', () => {
    expect(categorizeReferer('https://foo.ipfs.external.example/')).toBe(
      REFERER_UNKNOWN,
    );
    expect(
      categorizeReferer('https://stake.lido.fi.ipfs.external.example/'),
    ).toBe(REFERER_UNKNOWN);
  });

  it('collapses arbitrary external hosts to "unknown"', () => {
    expect(categorizeReferer('https://external.example/')).toBe(
      REFERER_UNKNOWN,
    );
    expect(
      categorizeReferer('https://external.example/?ip=' + 'x'.repeat(100)),
    ).toBe(REFERER_UNKNOWN);
    expect(categorizeReferer('https://lido.fi.external.example/')).toBe(
      REFERER_UNKNOWN,
    );
  });

  it('rejects look-alike hosts that pass naive substring matching', () => {
    expect(categorizeReferer('https://fake-stake.lido.fi.other.example/')).toBe(
      REFERER_UNKNOWN,
    );
  });

  it('strips port from the URL host before matching the allow-list', () => {
    expect(categorizeReferer('https://stake.lido.fi:8443/')).toBe(
      'stake.lido.fi',
    );
  });
});
