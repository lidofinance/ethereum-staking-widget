import { promises as fs } from 'fs';
import { standardFetcher } from 'utils/standardFetcher';

vi.mock('next/config', () => ({
  default: () => ({
    serverRuntimeConfig: {},
    publicRuntimeConfig: {},
  }),
}));

vi.mock('config', () => ({
  config: {
    ipfsMode: false,
    developmentMode: false,
    CACHE_EXTERNAL_CONFIG_KEY: 'cache-external-config',
    // short TTLs so tests can await real cache expiry
    CACHE_EXTERNAL_CONFIG_TTL: 50,
    CACHE_EXTERNAL_CONFIG_FILE_TTL: 50,
  },
}));

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}));

vi.mock('utils/standardFetcher', () => ({
  standardFetcher: vi.fn(),
}));

vi.mock('utilsApi/fetchApiWrapper', () => ({
  responseTimeExternalMetricWrapper: ({
    request,
  }: {
    request: () => Promise<unknown>;
  }) => request(),
}));

const { metricsLabelsMock } = vi.hoisted(() => ({
  metricsLabelsMock: vi.fn(() => ({ inc: vi.fn() })),
}));
vi.mock('utilsApi/metrics', () => ({
  default: {
    request: {
      configManifestLoadError: { labels: metricsLabelsMock },
    },
  },
}));

const VALID_MANIFEST = {
  baseConfig: {},
  '1': { leastSafeVersion: '1.0.0' },
};

const readFileMock = vi.mocked(fs.readFile);
const standardFetcherMock = vi.mocked(standardFetcher);

const importFreshModule = async () => {
  // module-level memory cache requires a fresh module instance per test
  vi.resetModules();
  return await import('utilsApi/fetch-external-manifest');
};

describe('fetchExternalManifest with CONFIG_MANIFEST_PATH', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CONFIG_MANIFEST_PATH =
      '/app/runtime-config/REMOTE_CONFIG_MANIFEST.json';
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete process.env.CONFIG_MANIFEST_PATH;
    errorSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it('reads and parses the manifest from file, without remote fetch', async () => {
    readFileMock.mockResolvedValue(JSON.stringify(VALID_MANIFEST));
    const { fetchExternalManifest } = await importFreshModule();

    const { ___prefetch_manifest___ } = await fetchExternalManifest();

    expect(readFileMock).toHaveBeenCalledWith(
      '/app/runtime-config/REMOTE_CONFIG_MANIFEST.json',
      'utf-8',
    );
    expect(standardFetcherMock).not.toHaveBeenCalled();
    expect(___prefetch_manifest___).toHaveProperty('1');
    expect(___prefetch_manifest___['1']?.leastSafeVersion).toBe('1.0.0');
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

    const { ___prefetch_manifest___ } = await fetchExternalManifest();

    // local fallback is the bundled REMOTE_CONFIG_MANIFEST.json
    expect(___prefetch_manifest___).toHaveProperty('1');
    expect(standardFetcherMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('falls back to the local manifest when the file is not valid JSON', async () => {
    readFileMock.mockResolvedValue('{ broken json');
    const { fetchExternalManifest } = await importFreshModule();

    const { ___prefetch_manifest___ } = await fetchExternalManifest();

    expect(___prefetch_manifest___).toHaveProperty('1');
    expect(standardFetcherMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('falls back to the local manifest when the file fails schema validation', async () => {
    readFileMock.mockResolvedValue('null');
    const { fetchExternalManifest } = await importFreshModule();

    const { ___prefetch_manifest___ } = await fetchExternalManifest();

    expect(___prefetch_manifest___).toHaveProperty('1');
    expect(standardFetcherMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('serves last known good manifest when the file degrades after a successful read', async () => {
    readFileMock.mockResolvedValueOnce(JSON.stringify(VALID_MANIFEST));
    readFileMock.mockRejectedValue(new Error('EACCES'));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest();
    // let the memory cache expire so the file is re-read
    await new Promise((resolve) => setTimeout(resolve, 80));
    const { ___prefetch_manifest___ } = await fetchExternalManifest();

    expect(readFileMock).toHaveBeenCalledTimes(2);
    // last good file config, not the bundled local fallback
    expect(___prefetch_manifest___['1']?.leastSafeVersion).toBe('1.0.0');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('does not cache the fallback result, so a fixed file is picked up', async () => {
    readFileMock.mockRejectedValueOnce(new Error('ENOENT'));
    readFileMock.mockResolvedValue(JSON.stringify(VALID_MANIFEST));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest();
    const { ___prefetch_manifest___ } = await fetchExternalManifest();

    expect(readFileMock).toHaveBeenCalledTimes(2);
    expect(___prefetch_manifest___['1']?.leastSafeVersion).toBe('1.0.0');
  });

  it('fetches the remote manifest when CONFIG_MANIFEST_PATH is not set', async () => {
    delete process.env.CONFIG_MANIFEST_PATH;
    standardFetcherMock.mockResolvedValue(VALID_MANIFEST);
    const { fetchExternalManifest } = await importFreshModule();

    const { ___prefetch_manifest___ } = await fetchExternalManifest();

    expect(readFileMock).not.toHaveBeenCalled();
    expect(standardFetcherMock).toHaveBeenCalledTimes(1);
    expect(___prefetch_manifest___).toHaveProperty('1');
  });

  it('logs every successful file load', async () => {
    readFileMock.mockResolvedValue(JSON.stringify(VALID_MANIFEST));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest(); // file read -> log
    await fetchExternalManifest(); // cache hit -> no read, no log
    // let the memory cache expire so the file is re-read
    await new Promise((resolve) => setTimeout(resolve, 80));
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
    standardFetcherMock.mockResolvedValue(VALID_MANIFEST);
    const { fetchExternalManifest } = await importFreshModule();

    const { ___prefetch_manifest___ } = await fetchExternalManifest();

    expect(readFileMock).not.toHaveBeenCalled();
    expect(standardFetcherMock).toHaveBeenCalledTimes(1);
    expect(___prefetch_manifest___).toHaveProperty('1');
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
    await new Promise((resolve) => setTimeout(resolve, 80));
    await fetchExternalManifest();
    expect(getLastManifestSource()).toBe('last-known-good');
  });

  it('serves last known good manifest when the remote degrades after a successful fetch', async () => {
    delete process.env.CONFIG_MANIFEST_PATH;
    standardFetcherMock.mockResolvedValueOnce(VALID_MANIFEST);
    standardFetcherMock.mockRejectedValue(new Error('502'));
    const { fetchExternalManifest } = await importFreshModule();

    await fetchExternalManifest();
    // let the memory cache expire so the remote is re-fetched
    await new Promise((resolve) => setTimeout(resolve, 80));
    const { ___prefetch_manifest___ } = await fetchExternalManifest();

    // 1 successful fetch + 3 failed retries
    expect(standardFetcherMock).toHaveBeenCalledTimes(4);
    // last good remote config, not the bundled local fallback
    expect(___prefetch_manifest___['1']?.leastSafeVersion).toBe('1.0.0');
    expect(errorSpy).toHaveBeenCalled();
  });
});
