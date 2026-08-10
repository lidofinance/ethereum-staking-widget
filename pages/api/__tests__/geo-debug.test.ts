import type { NextApiRequest, NextApiResponse } from 'next';

import { geoDebugHandler } from 'utilsApi/geo-debug-handler';
import type { GeoDebugResponse } from 'utilsApi/geo-debug-handler';

type MockRes = NextApiResponse<GeoDebugResponse> & {
  _status: number;
  _sent: GeoDebugResponse;
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

describe('geoDebugHandler', () => {
  it('reports the country from cf-ipcountry', async () => {
    const res = makeRes();
    await geoDebugHandler(makeReq({ 'cf-ipcountry': 'US' }), res);

    expect(res._status).toBe(200);
    expect(res._sent.country).toBe('US');
    expect(res._sent.values['cf-ipcountry']).toBe('US');
  });

  it('reports null country when the header is absent', async () => {
    const res = makeRes();
    await geoDebugHandler(makeReq({}), res);

    expect(res._sent.country).toBeNull();
    expect(res._sent.viaCloudflare).toBe(false);
  });

  it('passes through CF placeholder values unnormalized', async () => {
    const res = makeRes();
    await geoDebugHandler(makeReq({ 'cf-ipcountry': 'XX' }), res);

    expect(res._sent.country).toBe('XX');
  });

  it('flags a request as proxied when cf-ray is present', async () => {
    const res = makeRes();
    await geoDebugHandler(makeReq({ 'cf-ray': '8f0a1b2c3d4e5f60-AMS' }), res);

    expect(res._sent.viaCloudflare).toBe(true);
  });

  it('never echoes IP or street-level headers as values', async () => {
    const res = makeRes();
    await geoDebugHandler(
      makeReq({
        'cf-connecting-ip': '203.0.113.7',
        'x-forwarded-for': '203.0.113.7',
        'cf-ipcity': 'Amsterdam',
        'cf-iplatitude': '52.37403',
      }),
      res,
    );

    const serialized = JSON.stringify(res._sent);
    expect(serialized).not.toContain('203.0.113.7');
    expect(serialized).not.toContain('Amsterdam');
    expect(serialized).not.toContain('52.37403');
    expect(res._sent.presence['cf-connecting-ip']).toBe(true);
    expect(res._sent.presence['cf-ipcity']).toBe(true);
    expect(res._sent.presence['cf-postal-code']).toBe(false);
  });

  it('joins repeated headers instead of dropping them', async () => {
    const res = makeRes();
    await geoDebugHandler(makeReq({ 'cf-ipcountry': ['US', 'NL'] }), res);

    expect(res._sent.country).toBe('US,NL');
  });
});
