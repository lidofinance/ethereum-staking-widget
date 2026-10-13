import { promises as fs } from 'node:fs';

/**
 * Port of develop's `utilsApi/__tests__/fetch-external-manifest.test.ts`,
 * adapted to the Fastify module: no `___prefetch_manifest___` wrapper, native
 * fetch instead of standardFetcher, config read from server config.
 */

vi.mock('node:fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}));

vi.mock('../../config.js', () => ({
  config: {
    // read env per call so per-test changes survive vi.resetModules
    get CONFIG_MANIFEST_PATH(): string | undefined {
      return process.env.CONFIG_MANIFEST_PATH?.trim() || undefined;
    },
    DEFAULT_CHAIN: 1,
    MANIFEST_OVERRIDE: undefined,
  },
  // imported by logger.ts (via utils/masked-error.ts) for secret masking
  rpcProvidersUrls: {},
}));

const { metricsLabelsMock, startTimerMock } = vi.hoisted(() => ({
  metricsLabelsMock: vi.fn(() => ({ inc: vi.fn() })),
  startTimerMock: vi.fn(() => vi.fn()),
}));
vi.mock('../../metrics/index.js', () => ({
  default: {
    request: {
      configManifestLoadError: { labels: metricsLabelsMock },
      apiTimingsExternal: { startTimer: startTimerMock },
    },
  },
}));

// bundled local fallback — distinct from VALID_MANIFEST so tests can tell
// local-fallback apart from last-known-good
const FALLBACK_MANIFEST = {
  baseConfig: {},
  '1': { leastSafeVersion: '0.0.0' },
};
vi.mock('REMOTE_CONFIG_MANIFEST.json', () => ({
  default: FALLBACK_MANIFEST,
}));

const VALID_MANIFEST = {
  baseConfig: {},
  '1': { leastSafeVersion: '1.0.0' },
};

const FILE_TTL_MS = 60 * 1000; // keep in sync with external-manifest.ts
const REMOTE_TTL_MS = 10 * 60 * 1000;

const readFileMock = vi.mocked(fs.readFile);
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const remoteResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  json: async () => data,
});

const importFreshModule = async () => {
  // module-level memory cache requires a fresh module instance per test
  vi.resetModules();
  return await import('../external-manifest.js');
};

describe('fetchExternalManifest with CONFIG_MANIFEST_PATH', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    process.env.CONFIG_MANIFEST_PATH =
      '/app/runtime-config/REMOTE_CONFIG_MANIFEST.json';
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete process.env.CONFIG_MANIFEST_PATH;
    vi.useRealTimers();
    errorSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it('reads and parses the manifest from file, without remote fetch', async () => {
    readFileMock.mockResolvedValue(JSON.stringify(VALID_MANIFEST));
    const { fetchExternalManifest } = await importFreshModule();

    const manifest = await fetchExternalManifest();

    expect(readFileMock).toHaveBeenCalledWith(
      '/app/runtime-config/REMOTE_CONFIG_MANIFEST.json',
      'utf-8',
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(manifest['1']?.leastSafeVersion).toBe('1.0.0');
  });

  it('caches the file result between calls', async () => {
    readFileMock.mockResolvedValue(JSON.stringify(VALID_MANIFEST));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest();
    await fetchExternalManifest();

    expect(readFileMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to the local manifest when the file is unreadable', async () => {
    readFileMock.mockRejectedValue(new Error('ENOENT'));
    const { fetchExternalManifest } = await importFreshModule();

    const manifest = await fetchExternalManifest();

    expect(manifest['1']?.leastSafeVersion).toBe('0.0.0');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('falls back to the local manifest when the file is not valid JSON', async () => {
    readFileMock.mockResolvedValue('{ broken json');
    const { fetchExternalManifest } = await importFreshModule();

    const manifest = await fetchExternalManifest();

    expect(manifest['1']?.leastSafeVersion).toBe('0.0.0');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('falls back to the local manifest when the file is not an object', async () => {
    readFileMock.mockResolvedValue('null');
    const { fetchExternalManifest } = await importFreshModule();

    const manifest = await fetchExternalManifest();

    expect(manifest['1']?.leastSafeVersion).toBe('0.0.0');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('serves last known good manifest when the file degrades after a successful read', async () => {
    readFileMock.mockResolvedValueOnce(JSON.stringify(VALID_MANIFEST));
    readFileMock.mockRejectedValue(new Error('EACCES'));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest();
    // let the memory cache expire so the file is re-read
    vi.advanceTimersByTime(FILE_TTL_MS + 1);
    const manifest = await fetchExternalManifest();

    expect(readFileMock).toHaveBeenCalledTimes(2);
    // last good file config, not the bundled local fallback
    expect(manifest['1']?.leastSafeVersion).toBe('1.0.0');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('does not cache the fallback result, so a fixed file is picked up', async () => {
    readFileMock.mockRejectedValueOnce(new Error('ENOENT'));
    readFileMock.mockResolvedValue(JSON.stringify(VALID_MANIFEST));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest();
    const manifest = await fetchExternalManifest();

    expect(readFileMock).toHaveBeenCalledTimes(2);
    expect(manifest['1']?.leastSafeVersion).toBe('1.0.0');
  });

  it('fetches the remote manifest when CONFIG_MANIFEST_PATH is not set', async () => {
    delete process.env.CONFIG_MANIFEST_PATH;
    fetchMock.mockResolvedValue(remoteResponse(VALID_MANIFEST));
    const { fetchExternalManifest } = await importFreshModule();

    const manifest = await fetchExternalManifest();

    expect(readFileMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(manifest['1']?.leastSafeVersion).toBe('1.0.0');
  });

  it('logs every successful file load', async () => {
    readFileMock.mockResolvedValue(JSON.stringify(VALID_MANIFEST));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest(); // file read -> log
    await fetchExternalManifest(); // cache hit -> no read, no log
    // let the memory cache expire so the file is re-read
    vi.advanceTimersByTime(FILE_TTL_MS + 1);
    await fetchExternalManifest(); // file read -> log

    expect(infoSpy).toHaveBeenCalledTimes(2);
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '/app/runtime-config/REMOTE_CONFIG_MANIFEST.json',
      ),
    );
  });

  it('does not log a successful load when the file is broken', async () => {
    readFileMock.mockRejectedValue(new Error('ENOENT'));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest();

    expect(infoSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('treats a whitespace-only CONFIG_MANIFEST_PATH as unset', async () => {
    process.env.CONFIG_MANIFEST_PATH = '   ';
    fetchMock.mockResolvedValue(remoteResponse(VALID_MANIFEST));
    const { fetchExternalManifest } = await importFreshModule();

    const manifest = await fetchExternalManifest();

    expect(readFileMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(manifest['1']?.leastSafeVersion).toBe('1.0.0');
  });

  it('reports a load-error metric with the file source when the file is broken', async () => {
    readFileMock.mockRejectedValue(new Error('ENOENT'));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest();

    expect(metricsLabelsMock).toHaveBeenCalledWith({ source: 'file' });
  });

  it('tracks the served manifest source for the X-Manifest-Source header', async () => {
    readFileMock.mockResolvedValueOnce(JSON.stringify(VALID_MANIFEST));
    readFileMock.mockRejectedValue(new Error('EACCES'));
    const { fetchExternalManifest, getLastManifestSource } =
      await importFreshModule();

    await fetchExternalManifest();
    expect(getLastManifestSource()).toBe('file');

    // let the memory cache expire so the file is re-read
    vi.advanceTimersByTime(FILE_TTL_MS + 1);
    await fetchExternalManifest();
    expect(getLastManifestSource()).toBe('last-known-good');
  });

  it('serves last known good manifest when the remote degrades after a successful fetch', async () => {
    delete process.env.CONFIG_MANIFEST_PATH;
    fetchMock.mockResolvedValueOnce(remoteResponse(VALID_MANIFEST));
    fetchMock.mockRejectedValue(new Error('502'));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest();
    // let the memory cache expire so the remote is re-fetched
    vi.advanceTimersByTime(REMOTE_TTL_MS + 1);
    const manifest = await fetchExternalManifest();

    // 1 successful fetch + 3 failed retries
    expect(fetchMock).toHaveBeenCalledTimes(4);
    // last good remote config, not the bundled local fallback
    expect(manifest['1']?.leastSafeVersion).toBe('1.0.0');
    expect(errorSpy).toHaveBeenCalled();
    expect(metricsLabelsMock).toHaveBeenCalledWith({ source: 'remote' });
  });
});
