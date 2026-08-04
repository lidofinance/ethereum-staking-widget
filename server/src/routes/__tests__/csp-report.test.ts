import Fastify, { type FastifyInstance } from 'fastify';

import { cspReportRoute } from '../csp-report.js';

/**
 * Port of `pages/api/__tests__/csp-report.test.ts` onto Fastify `inject()`.
 * Same invariants (bounty F5): always 200, violation nested under
 * `violation` (never spread), malformed JSON logged as `parseError`.
 */
type CapturedLog = { type?: string; violation?: unknown };

const buildApp = (): { app: FastifyInstance; logs: CapturedLog[] } => {
  const logs: CapturedLog[] = [];
  const app = Fastify({
    logger: {
      level: 'warn',
      stream: {
        write(line: string) {
          try {
            logs.push(JSON.parse(line) as CapturedLog);
          } catch {
            /* non-JSON log line — ignore */
          }
        },
      },
    },
  });
  void app.register(cspReportRoute);
  return { app, logs };
};

describe('POST /api/csp-report', () => {
  let app: FastifyInstance;
  let logs: CapturedLog[];

  beforeEach(() => {
    ({ app, logs } = buildApp());
  });

  afterEach(async () => {
    await app.close();
  });

  it('logs an object body under the `violation` key (does not spread)', async () => {
    const body = { 'csp-report': { 'violated-directive': 'script-src' } };
    const res = await app.inject({
      method: 'POST',
      url: '/api/csp-report',
      headers: { 'content-type': 'application/csp-report' },
      payload: JSON.stringify(body),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
    const logged = logs.find((l) => l.type === 'CSP Violation');
    expect(logged).toBeDefined();
    expect(logged?.violation).toEqual(body);
  });

  it('nests payload so caller `type` cannot shadow the discriminator', async () => {
    const body = {
      type: 'AccessLog',
      userId: 'admin',
      action: 'login_success',
    };
    const res = await app.inject({
      method: 'POST',
      url: '/api/csp-report',
      headers: { 'content-type': 'application/reports+json' },
      payload: JSON.stringify(body),
    });

    expect(res.statusCode).toBe(200);
    const logged = logs.find((l) => l.type === 'CSP Violation');
    expect(logged?.type).toBe('CSP Violation');
    expect(logged?.violation).toEqual(body);
    expect((logged?.violation as { type: string }).type).toBe('AccessLog');
  });

  it('handles malformed JSON gracefully (no throw, 200, parseError logged)', async () => {
    const malformed = '{ not json';
    const res = await app.inject({
      method: 'POST',
      url: '/api/csp-report',
      headers: { 'content-type': 'application/csp-report' },
      payload: malformed,
    });

    expect(res.statusCode).toBe(200);
    const logged = logs.find((l) => l.type === 'CSP Violation');
    expect(logged?.violation).toEqual({
      parseError: true,
      bodyLen: malformed.length,
    });
  });

  it('answers 405 + Allow for wrong methods', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/csp-report' });
    expect(res.statusCode).toBe(405);
    expect(res.headers.allow).toBe('POST');
  });
});
