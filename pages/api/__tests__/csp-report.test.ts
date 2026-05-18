import type { NextApiRequest, NextApiResponse } from 'next';

import { cspReportHandler } from 'utilsApi/csp-report-handler';

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
    send(body: unknown) {
      this._sent = body;
      return this;
    },
    json(body: unknown) {
      this._sent = body;
      return this;
    },
  };
  return res as MockRes;
};

const makeReq = (body: unknown, method = 'POST'): NextApiRequest =>
  ({
    method,
    body,
    headers: {},
    query: {},
  }) as unknown as NextApiRequest;

describe('cspReportHandler', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('logs an object body under the `violation` key (does not spread)', async () => {
    const body = { 'csp-report': { 'violated-directive': 'script-src' } };
    const res = makeRes();
    await cspReportHandler(makeReq(body), res);

    expect(warnSpy).toHaveBeenCalledWith({
      type: 'CSP Violation',
      violation: body,
    });
    expect(res._status).toBe(200);
    expect(res._sent).toEqual({ status: 'ok' });
  });

  it('does NOT allow attacker to shadow the synthetic `type` field', async () => {
    // Attacker tries to inject a different `type` to mis-tag the log entry.
    const body = {
      type: 'AccessLog',
      userId: 'admin',
      action: 'login_success',
    };
    const res = makeRes();
    await cspReportHandler(makeReq(body), res);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const logged = warnSpy.mock.calls[0][0];
    // Synthetic discriminator unchanged.
    expect(logged.type).toBe('CSP Violation');
    // Attacker payload still recorded — but under the `violation` key.
    expect(logged.violation).toEqual(body);
    expect(logged.violation.type).toBe('AccessLog');
    // No top-level keys other than `type` and `violation` (no spread leakage).
    expect(Object.keys(logged).sort()).toEqual(['type', 'violation']);
  });

  it('parses a string body as JSON', async () => {
    const body = JSON.stringify({
      'csp-report': { 'violated-directive': 'img-src' },
    });
    const res = makeRes();
    await cspReportHandler(makeReq(body), res);

    const logged = warnSpy.mock.calls[0][0];
    expect(logged.type).toBe('CSP Violation');
    expect(logged.violation).toEqual({
      'csp-report': { 'violated-directive': 'img-src' },
    });
    expect(res._status).toBe(200);
  });

  it('handles malformed JSON gracefully (no throw, 200 response)', async () => {
    const malformed = '{ not json';
    const res = makeRes();

    // Must not throw — design intent in services-map: "must accept malformed
    // gracefully (a 500 poisons telemetry)".
    await expect(
      cspReportHandler(makeReq(malformed), res),
    ).resolves.toBeUndefined();

    const logged = warnSpy.mock.calls[0][0];
    expect(logged.type).toBe('CSP Violation');
    expect(logged.violation).toEqual({
      parseError: true,
      bodyLen: malformed.length,
    });
    expect(res._status).toBe(200);
  });

  it('handles null body gracefully', async () => {
    const res = makeRes();
    await cspReportHandler(makeReq(null), res);

    const logged = warnSpy.mock.calls[0][0];
    expect(logged.type).toBe('CSP Violation');
    expect(logged.violation).toEqual({});
    expect(res._status).toBe(200);
  });

  it('handles non-object, non-string body gracefully (e.g. number)', async () => {
    const res = makeRes();
    await cspReportHandler(makeReq(42 as unknown as object), res);

    const logged = warnSpy.mock.calls[0][0];
    expect(logged.type).toBe('CSP Violation');
    expect(logged.violation).toEqual({});
    expect(res._status).toBe(200);
  });
});
