import { promises as fs } from 'node:fs';
import Fastify from 'fastify';

/**
 * /api/validation: upstream proxy with server-side blocklist-file fallback.
 * Source order (see validation.ts): upstream → file (fail-closed on broken
 * file) → 502 without a file; file-only when no upstream; 404 when neither.
 */

vi.mock('node:fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}));

vi.mock('../../config.js', () => ({
  config: {
    // read env per call so per-test changes survive vi.resetModules
    get VALIDATION_SERVICE_BASE_PATH(): string | undefined {
      return process.env.TEST_VALIDATION_UPSTREAM || undefined;
    },
    get VALIDATION_FILE_PATH(): string | undefined {
      return process.env.TEST_VALIDATION_FILE || undefined;
    },
  },
  // imported by logger.ts (via utils/masked-error.ts) for secret masking
  rpcProvidersUrls: {},
}));

vi.mock('../../metrics/index.js', () => ({
  default: {
    request: {
      validationFileLoadError: { labels: vi.fn(() => ({ inc: vi.fn() })) },
    },
  },
}));

vi.mock('../../utils/external-manifest.js', () => ({
  getExternalManifestConfig: vi.fn(async () => ({
    api: { validation: { version: '1' } },
  })),
}));

const readFileMock = vi.mocked(fs.readFile);
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const BLOCKED = '0x1000000000000000000000000000000000000000';
const CLEAN = '0x2000000000000000000000000000000000000002';
const FILE_CONTENT = JSON.stringify({ addresses: [BLOCKED] });

const upstreamResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: 'status',
  json: async () => data,
});

const buildApp = async () => {
  // fresh module per app: the validation-file cache is module-level
  vi.resetModules();
  const { validationRoute } = await import('../validation.js');
  const app = Fastify({ logger: false });
  await app.register(validationRoute);
  return app;
};

const inject = (app: Awaited<ReturnType<typeof buildApp>>, address: string) =>
  app.inject({ method: 'GET', url: `/api/validation?address=${address}` });

describe('/api/validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEST_VALIDATION_UPSTREAM = 'https://validation.test';
    process.env.TEST_VALIDATION_FILE = '/app/validation/validation.json';
  });

  afterEach(() => {
    delete process.env.TEST_VALIDATION_UPSTREAM;
    delete process.env.TEST_VALIDATION_FILE;
  });

  it('proxies the upstream answer and labels the source', async () => {
    fetchMock.mockResolvedValue(upstreamResponse({ isValid: false }));
    const app = await buildApp();

    const res = await inject(app, BLOCKED);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ isValid: false });
    expect(res.headers['x-validation-source']).toBe('upstream');
    expect(fetchMock.mock.calls[0][0]).toContain(
      `/v1/check/${BLOCKED.toLowerCase()}`,
    );
    expect(readFileMock).not.toHaveBeenCalled();
  });

  it('falls back to the file when the upstream is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    readFileMock.mockResolvedValue(FILE_CONTENT);
    const app = await buildApp();

    const blocked = await inject(app, BLOCKED);
    expect(blocked.statusCode).toBe(200);
    expect(blocked.json()).toEqual({ isValid: false });
    expect(blocked.headers['x-validation-source']).toBe('file');

    const clean = await inject(app, CLEAN);
    expect(clean.json()).toEqual({ isValid: true });
  });

  it('falls back to the file on an upstream 5xx', async () => {
    fetchMock.mockResolvedValue(upstreamResponse({ oops: true }, 500));
    readFileMock.mockResolvedValue(FILE_CONTENT);
    const app = await buildApp();

    const res = await inject(app, CLEAN);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ isValid: true });
    expect(res.headers['x-validation-source']).toBe('file');
  });

  it('rejects ALL addresses when the fallback file is broken (fail-closed)', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    readFileMock.mockResolvedValue('{ broken json');
    const app = await buildApp();

    const res = await inject(app, CLEAN);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ isValid: false });
    expect(res.headers['x-validation-source']).toBe('file');
  });

  it('answers 502 when the upstream fails and no file is configured', async () => {
    delete process.env.TEST_VALIDATION_FILE;
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const app = await buildApp();

    const res = await inject(app, CLEAN);

    expect(res.statusCode).toBe(502);
    expect(readFileMock).not.toHaveBeenCalled();
  });

  it('serves from the file when no upstream is configured (file-only mode)', async () => {
    delete process.env.TEST_VALIDATION_UPSTREAM;
    readFileMock.mockResolvedValue(FILE_CONTENT);
    const app = await buildApp();

    const res = await inject(app, BLOCKED);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ isValid: false });
    expect(res.headers['x-validation-source']).toBe('file');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('404s when neither upstream nor file is configured', async () => {
    delete process.env.TEST_VALIDATION_UPSTREAM;
    delete process.env.TEST_VALIDATION_FILE;
    const app = await buildApp();

    const res = await inject(app, CLEAN);

    expect(res.statusCode).toBe(404);
  });

  it('rejects a malformed address with 400 before any upstream call', async () => {
    const app = await buildApp();

    const res = await inject(app, 'not-an-address');

    expect(res.statusCode).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(readFileMock).not.toHaveBeenCalled();
  });

  it('answers wrong methods with 405 + Allow, including when disabled', async () => {
    for (const env of [undefined, 'https://validation.test']) {
      if (env) process.env.TEST_VALIDATION_UPSTREAM = env;
      else {
        delete process.env.TEST_VALIDATION_UPSTREAM;
        delete process.env.TEST_VALIDATION_FILE;
      }
      const app = await buildApp();
      const res = await app.inject({ method: 'POST', url: '/api/validation' });
      expect(res.statusCode).toBe(405);
      expect(res.headers.allow).toBe('GET');
    }
  });
});
