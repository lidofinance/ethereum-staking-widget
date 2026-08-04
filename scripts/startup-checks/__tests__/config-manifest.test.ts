import { validateManifest } from '../config-manifest.mjs';
import realManifest from 'REMOTE_CONFIG_MANIFEST.json';

describe('validateManifest (startup check)', () => {
  it('accepts the real bundled manifest', () => {
    expect(validateManifest(realManifest)).toBeNull();
  });

  it('accepts a minimal valid manifest', () => {
    expect(
      validateManifest({
        baseConfig: {},
        '1': { leastSafeVersion: '1.0.0' },
      }),
    ).toBeNull();
  });

  it('rejects non-object values', () => {
    expect(validateManifest(null)).toMatch(/non-array object/);
    expect(validateManifest([])).toMatch(/non-array object/);
    expect(validateManifest('{}')).toMatch(/non-array object/);
  });

  it('rejects a manifest without baseConfig', () => {
    expect(validateManifest({ '1': { leastSafeVersion: '1.0.0' } })).toMatch(
      /baseConfig/,
    );
  });

  it('rejects a manifest without chain-keyed entries', () => {
    expect(validateManifest({ baseConfig: {}, foo: 'bar' })).toMatch(
      /chain-keyed/,
    );
  });

  it('rejects a chain entry without a string leastSafeVersion', () => {
    // the exact shape that used to boot "successfully" and then
    // silently degrade to the build-time manifest at runtime
    expect(validateManifest({ baseConfig: {}, '1': {} })).toMatch(
      /leastSafeVersion/,
    );
    expect(
      validateManifest({ baseConfig: {}, '1': { leastSafeVersion: 1 } }),
    ).toMatch(/leastSafeVersion/);
  });
});
