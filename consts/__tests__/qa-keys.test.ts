import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import { QA_KEYS, QA_MOCK_GROUPS, QA_CUSTOM_UI_KEYS } from 'consts/qa-keys';
import { LEVEL_ORDER } from 'features/dex-withdrawals/cowswap/trade-guard/utils/resolve-level';

const PROJECT_ROOT = join(__dirname, '..', '..');

// Frontend source dirs that may contain QA override call sites.
const SCANNED_DIRS = [
  'app',
  'config',
  'consts',
  'features',
  'modules',
  'providers',
  'shared',
  'shims',
  'utils',
];

const REGISTRY_FILE = join('consts', 'qa-keys.ts');

const listSourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

describe('QA keys registry', () => {
  const allKeys = Object.values(QA_KEYS);
  const registryKeys = QA_MOCK_GROUPS.flatMap((group) =>
    group.mocks.map((mock) => mock.key),
  );

  it('has unique localStorage keys', () => {
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });

  it('exposes every key in exactly one drawer descriptor or custom UI', () => {
    expect([...registryKeys, ...QA_CUSTOM_UI_KEYS].sort()).toEqual(
      allKeys.slice().sort(),
    );
  });

  it('trade-guard level options match LEVEL_ORDER', () => {
    const descriptor = QA_MOCK_GROUPS.flatMap((g) => g.mocks).find(
      (m) => m.key === QA_KEYS.tradeGuardLevel,
    );
    expect(descriptor?.type).toBe('enum');
    expect(descriptor?.type === 'enum' && [...descriptor.options]).toEqual(
      LEVEL_ORDER,
    );
  });

  it('has no QA key literals outside the registry', () => {
    // New keys must land in consts/qa-keys.ts, not as inline literals.
    const literalPattern =
      /['"`](mock-qa-helpers-[\w-]*|mockAmountBanner\w*|mockLimitReached|getStakeLimitFullInfo)['"`]/;

    const offenders = SCANNED_DIRS.flatMap((dir) =>
      listSourceFiles(join(PROJECT_ROOT, dir)),
    )
      .map((file) => relative(PROJECT_ROOT, file))
      .filter((file) => file !== REGISTRY_FILE && !file.includes('__tests__'))
      .filter((file) =>
        literalPattern.test(readFileSync(join(PROJECT_ROOT, file), 'utf8')),
      );

    expect(offenders).toEqual([]);
  });
});
