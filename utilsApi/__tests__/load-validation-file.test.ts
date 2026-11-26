import { loadValidationFile } from '../load-validation-file';

const mocks = vi.hoisted(() => ({
  runtime: {},
}));

vi.mock('next/config', () => ({
  default: () => ({ serverRuntimeConfig: mocks.runtime }),
}));
vi.mock('config', () => ({ config: {} }));
vi.mock('utilsApi/metrics', () => ({
  default: {
    request: {
      validationFileLoadError: { labels: () => ({ inc: vi.fn() }) },
    },
  },
}));

describe('loadValidationFile path', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.runtime = {};
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('treats a blank path as not configured', async () => {
    vi.stubEnv('VALIDATION_FILE_PATH', '   ');
    mocks.runtime = { validationFilePath: ' ' };
    expect(await loadValidationFile()).toEqual({ addresses: [] });
  });

  it('behaves the same as an unset path', async () => {
    vi.stubEnv('VALIDATION_FILE_PATH', '');
    const unset = await loadValidationFile();
    vi.stubEnv('VALIDATION_FILE_PATH', '\t \n');
    expect(await loadValidationFile()).toEqual(unset);
  });

  it('still reports a configured but unreadable path as broken', async () => {
    vi.stubEnv('VALIDATION_FILE_PATH', ' /nonexistent/validation.json ');
    expect(await loadValidationFile()).toEqual({
      addresses: [],
      isBroken: true,
    });
  });
});
