import type { NextApiRequest, NextApiResponse } from 'next';

import { createRewardsHandler } from '../rewards-handler';

const VALID_ADDRESS = '0x' + '0'.repeat(40);

type MockRes = NextApiResponse & {
  _status: number;
  _json: unknown;
};

const makeRes = (): MockRes => {
  const res: any = {
    _status: 0,
    _json: undefined,
    status(code: number) {
      this._status = code;
      return this;
    },
    json(body: unknown) {
      this._json = body;
      return this;
    },
  };
  return res as MockRes;
};

const makeReq = (query: Record<string, string>): NextApiRequest =>
  ({ method: 'GET', headers: {}, query }) as unknown as NextApiRequest;

describe('createRewardsHandler', () => {
  it('forwards valid request to the proxy without touching response itself', async () => {
    const proxy = jest
      .fn()
      .mockImplementation(
        async (_req: NextApiRequest, res: NextApiResponse) => {
          res.status(200).json({ ok: true });
        },
      );
    const handler = createRewardsHandler(proxy);
    const res = makeRes();

    await handler(
      makeReq({ address: VALID_ADDRESS, limit: '10', skip: '0' }),
      res,
    );

    expect(proxy).toHaveBeenCalledTimes(1);
    expect(res._status).toBe(200);
    expect(res._json).toEqual({ ok: true });
  });

  it('returns 400 and does NOT invoke the proxy on invalid address', async () => {
    const proxy = jest.fn();
    const handler = createRewardsHandler(proxy);
    const res = makeRes();

    await handler(makeReq({ address: '0xdeadbeef' }), res);

    expect(proxy).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
    expect((res._json as { error: string }).error).toBe(
      'Invalid query parameters',
    );
  });

  it('returns 400 on limit above MAX_LIMIT', async () => {
    const proxy = jest.fn();
    const handler = createRewardsHandler(proxy);
    const res = makeRes();

    await handler(makeReq({ address: VALID_ADDRESS, limit: '1000000' }), res);

    expect(proxy).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
  });

  it('returns 400 on unknown query keys (strict mode)', async () => {
    const proxy = jest.fn();
    const handler = createRewardsHandler(proxy);
    const res = makeRes();

    await handler(
      makeReq({ address: VALID_ADDRESS, _: 'cache-buster', pad: 'junk' }),
      res,
    );

    expect(proxy).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
  });

  it('returns 400 on missing required `address`', async () => {
    const proxy = jest.fn();
    const handler = createRewardsHandler(proxy);
    const res = makeRes();

    await handler(makeReq({ limit: '10' }), res);

    expect(proxy).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
  });

  it('forwards minimal valid request (address only) to proxy', async () => {
    const proxy = jest
      .fn()
      .mockImplementation(
        async (_req: NextApiRequest, res: NextApiResponse) => {
          res.status(200).json({ ok: true });
        },
      );
    const handler = createRewardsHandler(proxy);
    const res = makeRes();

    await handler(makeReq({ address: VALID_ADDRESS }), res);

    expect(proxy).toHaveBeenCalledTimes(1);
    expect(res._status).toBe(200);
  });

  it('returns 400 response body contains a `details` array of zod issues', async () => {
    const proxy = jest.fn();
    const handler = createRewardsHandler(proxy);
    const res = makeRes();

    await handler(makeReq({ address: '0xbad', limit: 'abc' }), res);

    expect(res._status).toBe(400);
    const body = res._json as {
      error: string;
      details: Array<{ path: string; message: string }>;
    };
    expect(body.error).toBe('Invalid query parameters');
    expect(Array.isArray(body.details)).toBe(true);
    expect(body.details.length).toBeGreaterThanOrEqual(1);
  });
});
