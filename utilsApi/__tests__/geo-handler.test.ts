import type { NextApiRequest, NextApiResponse } from 'next';
import type { MockInstance } from 'vitest';

import type { ManifestConfig } from 'config/external-config';

import { getExternalConfig } from '../get-external-config';
import { geoHandler } from '../geo-handler';

vi.mock('../get-external-config', () => ({
  getExternalConfig: vi.fn(),
}));

// the handler only reads these two, and both need to vary per test
const configMock = vi.hoisted(() => ({
  enableQaHelpers: false,
  qaGeoCountry: undefined as string | undefined,
}));

vi.mock('config', () => ({ config: configMock }));

const getExternalConfigMock = vi.mocked(getExternalConfig);

type MockRes = NextApiResponse & {
  _status: number;
  _sent: unknown;
};

const makeRes = (): MockRes => {
  const res: any = {
    _status: 0,
    _sent: undefined,
    status(code: number) {
      this._status = code;
      return this;
    },
    json(body: unknown) {
      this._sent = body;
      return this;
    },
  };
  return res as MockRes;
};

const makeReq = (headers: Record<string, string | string[]>): NextApiRequest =>
  ({
    method: 'GET',
    headers,
    query: {},
  }) as unknown as NextApiRequest;

// typed against the manifest so a renamed config field fails here rather than
// leaving the handler reading `undefined` through a loosely cast mock
const setLimitedCountries = (limited: string[]) => {
  const geo: ManifestConfig['geo'] = { limited };
  getExternalConfigMock.mockResolvedValue({ geo } as ManifestConfig);
};

const call = async (headers: Record<string, string | string[]> = {}) => {
  const res = makeRes();
  await geoHandler(makeReq(headers), res);
  return res;
};

describe('geoHandler', () => {
  let errorSpy: MockInstance;

  let infoSpy: MockInstance;

  beforeEach(() => {
    setLimitedCountries(['US']);
    configMock.enableQaHelpers = false;
    configMock.qaGeoCountry = undefined;
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
    infoSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('reports the limited experience for a listed country', async () => {
    const res = await call({ 'cf-ipcountry': 'US' });

    expect(res._status).toBe(200);
    expect(res._sent).toEqual({ country: 'US', availability: 'limited' });
  });

  it('reports the full experience for any other country', async () => {
    const res = await call({ 'cf-ipcountry': 'DE' });

    expect(res._sent).toEqual({ country: 'DE', availability: 'full' });
  });

  it('normalizes the case of the header before matching', async () => {
    const res = await call({ 'cf-ipcountry': ' us ' });

    expect(res._sent).toEqual({ country: 'US', availability: 'limited' });
  });

  it('matches case-insensitively against the manifest list', async () => {
    setLimitedCountries(['us']);
    const res = await call({ 'cf-ipcountry': 'US' });

    expect(res._sent).toEqual({ country: 'US', availability: 'limited' });
  });

  it('reads the first value when the header arrives repeated', async () => {
    const res = await call({ 'cf-ipcountry': ['US', 'DE'] });

    expect(res._sent).toEqual({ country: 'US', availability: 'limited' });
  });

  it('reports the full experience when the manifest lists no countries', async () => {
    setLimitedCountries([]);
    const res = await call({ 'cf-ipcountry': 'US' });

    expect(res._sent).toEqual({ country: 'US', availability: 'full' });
  });

  describe('fail-closed', () => {
    it('answers limited when the header is missing', async () => {
      const res = await call();

      expect(res._status).toBe(200);
      expect(res._sent).toEqual({ country: null, availability: 'limited' });
    });

    // 'XX' is what Cloudflare sends when it cannot resolve the address, 'T1'
    // for Tor exit nodes; the rest are not alpha-2 codes at all
    it.each(['XX', 'T1', 'USA', 'U', '', '  ', '1S'])(
      'answers limited for the unresolvable country %o',
      async (value) => {
        const res = await call({ 'cf-ipcountry': value });

        expect(res._sent).toEqual({ country: null, availability: 'limited' });
      },
    );

    it('answers limited when the config cannot be read', async () => {
      getExternalConfigMock.mockRejectedValue(
        new Error('manifest unavailable'),
      );
      const res = await call({ 'cf-ipcountry': 'DE' });

      expect(res._status).toBe(200);
      expect(res._sent).toEqual({ country: 'DE', availability: 'limited' });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('never answers full without a resolved country', async () => {
      setLimitedCountries([]);
      const res = await call();

      expect(res._sent).toEqual({ country: null, availability: 'limited' });
    });
  });

  describe('QA_GEO_COUNTRY', () => {
    it('is ignored while QA helpers are off', async () => {
      configMock.qaGeoCountry = 'DE';
      const res = await call();

      expect(res._sent).toEqual({ country: null, availability: 'limited' });
    });

    it('stands in for a missing header when QA helpers are on', async () => {
      configMock.enableQaHelpers = true;
      configMock.qaGeoCountry = 'DE';
      const res = await call();

      expect(res._sent).toEqual({ country: 'DE', availability: 'full' });
    });

    it('runs the manifest lookup on the stand-in like any other country', async () => {
      configMock.enableQaHelpers = true;
      configMock.qaGeoCountry = 'us';
      const res = await call();

      expect(res._sent).toEqual({ country: 'US', availability: 'limited' });
    });

    it('never overrides a header Cloudflare did set', async () => {
      configMock.enableQaHelpers = true;
      configMock.qaGeoCountry = 'DE';
      const res = await call({ 'cf-ipcountry': 'US' });

      expect(res._sent).toEqual({ country: 'US', availability: 'limited' });
    });

    it.each(['XX', 'T1', 'USA', '', 'not-a-code'])(
      'falls back to limited for the unusable value %o',
      async (value) => {
        configMock.enableQaHelpers = true;
        configMock.qaGeoCountry = value;
        const res = await call();

        expect(res._sent).toEqual({ country: null, availability: 'limited' });
      },
    );
  });
});
