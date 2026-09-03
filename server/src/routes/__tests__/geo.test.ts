import Fastify, { type FastifyInstance } from 'fastify';
import type { MockInstance } from 'vitest';

import { geoRoute } from '../geo.js';
import { getExternalManifestConfig } from '../../utils/external-manifest.js';

/**
 * Port of develop's `utilsApi/__tests__/geo-handler.test.ts` onto Fastify
 * `inject()`. Same invariants: always 200, fail-closed (`limited` unless the
 * country is positively resolved AND the config is readable AND the country
 * is not listed), QA_GEO_COUNTRY is a fallback for the header, never an
 * override.
 */

// the route only reads these two, and both need to vary per test
const configMock = vi.hoisted(() => ({
  ENABLE_QA_HELPERS: false,
  QA_GEO_COUNTRY: undefined as string | undefined,
}));

vi.mock('../../config.js', () => ({
  config: configMock,
  // imported by logger.ts (via utils/masked-error.ts) for secret masking
  rpcProvidersUrls: {},
}));

vi.mock('../../utils/external-manifest.js', () => ({
  getExternalManifestConfig: vi.fn(),
}));

const getExternalManifestConfigMock = vi.mocked(getExternalManifestConfig);

const setLimitedCountries = (limited: string[]) => {
  getExternalManifestConfigMock.mockResolvedValue({ geo: { limited } });
};

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  await app.register(geoRoute);
  return app;
};

describe('GET /api/geo', () => {
  let app: FastifyInstance;
  let errorSpy: MockInstance;
  let infoSpy: MockInstance;

  const call = (headers: Record<string, string | string[]> = {}) =>
    app.inject({ method: 'GET', url: '/api/geo', headers });

  beforeEach(async () => {
    setLimitedCountries(['US']);
    configMock.ENABLE_QA_HELPERS = false;
    configMock.QA_GEO_COUNTRY = undefined;
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
    errorSpy.mockRestore();
    infoSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('reports the limited experience for a listed country', async () => {
    const res = await call({ 'cf-ipcountry': 'US' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ country: 'US', availability: 'limited' });
  });

  it('reports the full experience for any other country', async () => {
    const res = await call({ 'cf-ipcountry': 'DE' });

    expect(res.json()).toEqual({ country: 'DE', availability: 'full' });
  });

  it('normalizes the case of the header before matching', async () => {
    const res = await call({ 'cf-ipcountry': ' us ' });

    expect(res.json()).toEqual({ country: 'US', availability: 'limited' });
  });

  it('matches case-insensitively against the manifest list', async () => {
    setLimitedCountries(['us']);
    const res = await call({ 'cf-ipcountry': 'US' });

    expect(res.json()).toEqual({ country: 'US', availability: 'limited' });
  });

  // Node joins repeated headers into 'US, DE' before fastify sees them, and a
  // joined value is not an alpha-2 code — so a duplicated header (which real
  // Cloudflare never sends) lands on the fail-closed branch. Develop's test
  // asserted first-value-wins, but only against a hand-built mock request; a
  // real Node request behaved like this there too.
  it('fails closed when the header arrives repeated', async () => {
    const res = await call({ 'cf-ipcountry': ['US', 'DE'] });

    expect(res.json()).toEqual({ country: null, availability: 'limited' });
  });

  it('reports the full experience when the manifest lists no countries', async () => {
    setLimitedCountries([]);
    const res = await call({ 'cf-ipcountry': 'US' });

    expect(res.json()).toEqual({ country: 'US', availability: 'full' });
  });

  it('treats a manifest entry without a geo block as an empty list', async () => {
    getExternalManifestConfigMock.mockResolvedValue({});
    const res = await call({ 'cf-ipcountry': 'US' });

    expect(res.json()).toEqual({ country: 'US', availability: 'full' });
  });

  it('drops unrecognised entries instead of failing the whole list', async () => {
    getExternalManifestConfigMock.mockResolvedValue({
      geo: { limited: ['US', 'USA', 42, ' de '] },
    });

    const listed = await call({ 'cf-ipcountry': 'DE' });
    expect(listed.json()).toEqual({ country: 'DE', availability: 'limited' });

    const dropped = await call({ 'cf-ipcountry': 'FR' });
    expect(dropped.json()).toEqual({ country: 'FR', availability: 'full' });
  });

  describe('fail-closed', () => {
    it('answers limited when the header is missing', async () => {
      const res = await call();

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ country: null, availability: 'limited' });
    });

    // 'XX' is what Cloudflare sends when it cannot resolve the address, 'T1'
    // for Tor exit nodes; the rest are not alpha-2 codes at all
    it.each(['XX', 'T1', 'USA', 'U', '', '  ', '1S'])(
      'answers limited for the unresolvable country %o',
      async (value) => {
        const res = await call({ 'cf-ipcountry': value });

        expect(res.json()).toEqual({ country: null, availability: 'limited' });
      },
    );

    it('answers limited when the manifest cannot be read', async () => {
      getExternalManifestConfigMock.mockRejectedValue(
        new Error('manifest unavailable'),
      );
      const res = await call({ 'cf-ipcountry': 'DE' });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ country: 'DE', availability: 'limited' });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('answers limited when the manifest has no entry for the chain', async () => {
      getExternalManifestConfigMock.mockResolvedValue(null);
      const res = await call({ 'cf-ipcountry': 'DE' });

      expect(res.json()).toEqual({ country: 'DE', availability: 'limited' });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('answers limited when the geo block is malformed', async () => {
      getExternalManifestConfigMock.mockResolvedValue({
        geo: { limited: 'US' },
      });
      const res = await call({ 'cf-ipcountry': 'DE' });

      expect(res.json()).toEqual({ country: 'DE', availability: 'limited' });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('never answers full without a resolved country', async () => {
      setLimitedCountries([]);
      const res = await call();

      expect(res.json()).toEqual({ country: null, availability: 'limited' });
    });
  });

  describe('QA_GEO_COUNTRY', () => {
    it('is ignored while QA helpers are off', async () => {
      configMock.QA_GEO_COUNTRY = 'DE';
      const res = await call();

      expect(res.json()).toEqual({ country: null, availability: 'limited' });
    });

    it('stands in for a missing header when QA helpers are on', async () => {
      configMock.ENABLE_QA_HELPERS = true;
      configMock.QA_GEO_COUNTRY = 'DE';
      const res = await call();

      expect(res.json()).toEqual({ country: 'DE', availability: 'full' });
    });

    it('runs the manifest lookup on the stand-in like any other country', async () => {
      configMock.ENABLE_QA_HELPERS = true;
      configMock.QA_GEO_COUNTRY = 'us';
      const res = await call();

      expect(res.json()).toEqual({ country: 'US', availability: 'limited' });
    });

    it('never overrides a header Cloudflare did set', async () => {
      configMock.ENABLE_QA_HELPERS = true;
      configMock.QA_GEO_COUNTRY = 'DE';
      const res = await call({ 'cf-ipcountry': 'US' });

      expect(res.json()).toEqual({ country: 'US', availability: 'limited' });
    });

    it.each(['XX', 'T1', 'USA', '', 'not-a-code'])(
      'falls back to limited for the unusable value %o',
      async (value) => {
        configMock.ENABLE_QA_HELPERS = true;
        configMock.QA_GEO_COUNTRY = value;
        const res = await call();

        expect(res.json()).toEqual({ country: null, availability: 'limited' });
      },
    );
  });

  describe('transport', () => {
    it('forbids shared caching of the per-visitor answer', async () => {
      const res = await call({ 'cf-ipcountry': 'DE' });

      expect(res.headers['cache-control']).toBe(
        'private, no-store, must-revalidate',
      );
    });

    it('stays same-origin: no Access-Control-Allow-Origin', async () => {
      const res = await call({ 'cf-ipcountry': 'DE' });

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('answers 404 for wrong methods', async () => {
      const res = await app.inject({ method: 'POST', url: '/api/geo' });

      expect(res.statusCode).toBe(404);
    });
  });
});
