// real server config on purpose: the blank-path rule lives in its env schema
vi.mock('../../metrics/index.js', () => ({
  default: {
    request: {
      validationFileLoadError: { labels: () => ({ inc: vi.fn() }) },
    },
  },
}));

const loadWithEnv = async (path: string) => {
  vi.stubEnv('VALIDATION_FILE_PATH', path);
  vi.resetModules();
  const { config } = await import('../../config.js');
  const { getValidationFile } = await import('../validation-file.js');
  return { config, file: await getValidationFile() };
};

describe('getValidationFile path', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('treats a blank path as not configured', async () => {
    const { config, file } = await loadWithEnv('   ');
    expect(config.VALIDATION_FILE_PATH).toBeUndefined();
    expect(file).toEqual({ addresses: new Set(), isBroken: undefined });
  });

  it('behaves the same as an unset path', async () => {
    const unset = await loadWithEnv('');
    const blank = await loadWithEnv('\t \n');
    expect(blank).toEqual(unset);
  });

  it('still reports a configured but unreadable path as broken', async () => {
    const { config, file } = await loadWithEnv(
      ' /nonexistent/validation.json ',
    );
    expect(config.VALIDATION_FILE_PATH).toBe('/nonexistent/validation.json');
    expect(file).toEqual({ addresses: new Set(), isBroken: true });
  });
});
