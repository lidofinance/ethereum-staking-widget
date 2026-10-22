import type { NextApiRequest, NextApiResponse } from 'next';

import { enforceJsonOnly } from 'utilsApi/enforce-json-only';

type MockRes = NextApiResponse & {
  _status: number;
  _sent: unknown;
  _headers: Record<string, string>;
};

const makeRes = (): MockRes => {
  const res: any = {
    _status: 200,
    _sent: undefined,
    _headers: {},
    setHeader(name: string, value: string) {
      this._headers[name.toLowerCase()] = value;
      return this;
    },
    getHeader(name: string) {
      return this._headers[name.toLowerCase()];
    },
    status(code: number) {
      this._status = code;
      return this;
    },
    json(body: unknown) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
      this._sent = body;
      return this;
    },
  };
  return res as MockRes;
};

const makeReq = (
  headers: Record<string, string>,
  method = 'POST',
): NextApiRequest =>
  ({ method, headers, body: {}, query: {} }) as unknown as NextApiRequest;

// what viem's http transport sends: JSON, no Accept header
const JSON_POST = { 'content-type': 'application/json' };
// what Chromium sends on a top-level form navigation
const NAVIGATION = {
  'content-type': 'application/x-www-form-urlencoded',
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
};

describe('enforceJsonOnly request guard', () => {
  it('passes a JSON POST without an Accept header', async () => {
    const next = vi.fn();
    await enforceJsonOnly(makeReq(JSON_POST), makeRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it.each(['*/*', 'application/json', 'application/json, */*;q=0.5'])(
    'passes Accept %j',
    async (accept) => {
      const next = vi.fn();
      await enforceJsonOnly(makeReq({ ...JSON_POST, accept }), makeRes(), next);
      expect(next).toHaveBeenCalledTimes(1);
    },
  );

  it('passes a JSON content type with parameters', async () => {
    const next = vi.fn();
    await enforceJsonOnly(
      makeReq({ 'content-type': 'Application/JSON; charset=utf-8' }),
      makeRes(),
      next,
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects a form navigation with 415 before the handler runs', async () => {
    const next = vi.fn();
    const res = makeRes();
    await enforceJsonOnly(makeReq(NAVIGATION), res, next);
    expect(res._status).toBe(415);
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    'application/x-www-form-urlencoded',
    'text/plain',
    'multipart/form-data; boundary=x',
  ])('rejects a %s body', async (contentType) => {
    const res = makeRes();
    await enforceJsonOnly(
      makeReq({ 'content-type': contentType }),
      res,
      vi.fn(),
    );
    expect(res._status).toBe(415);
  });

  it('rejects a POST without a content type', async () => {
    const res = makeRes();
    await enforceJsonOnly(makeReq({}), res, vi.fn());
    expect(res._status).toBe(415);
  });

  it.each([
    'text/html',
    'application/xhtml+xml',
    'image/svg+xml',
    'application/json, text/html',
  ])('rejects Accept %j with 406', async (accept) => {
    const next = vi.fn();
    const res = makeRes();
    await enforceJsonOnly(makeReq({ ...JSON_POST, accept }), res, next);
    expect(res._status).toBe(406);
    expect(next).not.toHaveBeenCalled();
  });

  it('does not require a body type on a GET, leaving it to the method guard', async () => {
    const next = vi.fn();
    await enforceJsonOnly(makeReq({}, 'GET'), makeRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('enforceJsonOnly response pin', () => {
  it.each([
    'application/xhtml+xml',
    'image/svg+xml',
    'text/html; charset=utf-8',
    'application/json, text/html',
  ])('pins Content-Type to JSON when the handler sets %j', async (type) => {
    const res = makeRes();
    await enforceJsonOnly(makeReq(JSON_POST), res, async () => {
      res.setHeader('Content-Type', type);
    });
    expect(res.getHeader('content-type')).toBe('application/json');
  });

  it('pins the type through the lowercase header name', async () => {
    const res = makeRes();
    await enforceJsonOnly(makeReq(JSON_POST), res, async () => {
      res.setHeader('content-type', 'text/html');
    });
    expect(res.getHeader('content-type')).toBe('application/json');
  });

  it('sets a JSON type and a sandbox CSP before the handler runs', async () => {
    const res = makeRes();
    await enforceJsonOnly(makeReq(JSON_POST), res, async () => {});
    expect(res.getHeader('content-type')).toBe('application/json');
    expect(res.getHeader('content-security-policy')).toBe('sandbox');
  });

  it('keeps the pin and the sandbox on its own rejections', async () => {
    const res = makeRes();
    await enforceJsonOnly(makeReq(NAVIGATION), res, vi.fn());
    expect(res.getHeader('content-type')).toBe('application/json');
    expect(res.getHeader('content-security-policy')).toBe('sandbox');
  });

  it('leaves other headers alone', async () => {
    const res = makeRes();
    await enforceJsonOnly(makeReq(JSON_POST), res, async () => {
      res.setHeader('Cache-Control', 'no-store');
    });
    expect(res.getHeader('cache-control')).toBe('no-store');
  });
});
