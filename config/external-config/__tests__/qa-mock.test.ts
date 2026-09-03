import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { configMock } = vi.hoisted(() => ({
  configMock: { enableQaHelpers: false },
}));

vi.mock('config', () => ({ config: configMock }));

import { QA_KEYS } from 'consts/qa-keys';
import { getQaMockManifestEntry } from 'config/external-config/qa-mock';

const VALID_ENTRY = { leastSafeVersion: '0.0.0' };

describe('getQaMockManifestEntry', () => {
  const storage = new Map<string, string>();

  const arm = (entry: unknown) => {
    storage.set(QA_KEYS.externalConfigMockEnabled, 'true');
    storage.set(
      QA_KEYS.externalConfigMock,
      typeof entry === 'string' ? entry : JSON.stringify(entry),
    );
  };

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
    });
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    configMock.enableQaHelpers = true;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns undefined when enableQaHelpers is off', () => {
    configMock.enableQaHelpers = false;
    arm(VALID_ENTRY);
    expect(getQaMockManifestEntry()).toBeUndefined();
  });

  it('returns undefined when the toggle is off', () => {
    storage.set(QA_KEYS.externalConfigMock, JSON.stringify(VALID_ENTRY));
    expect(getQaMockManifestEntry()).toBeUndefined();
  });

  it('returns a parsed entry with schema defaults applied', () => {
    arm(VALID_ENTRY);
    const entry = getQaMockManifestEntry();
    expect(entry?.leastSafeVersion).toBe('0.0.0');
    // config defaults come from the same schema the real fetch uses
    expect(entry?.config.pages).toEqual({});
  });

  it('falls back to undefined on invalid JSON', () => {
    arm('{not json');
    expect(getQaMockManifestEntry()).toBeUndefined();
  });

  it('falls back to undefined on schema violation', () => {
    arm({ config: {} }); // leastSafeVersion is required
    expect(getQaMockManifestEntry()).toBeUndefined();
  });
});
