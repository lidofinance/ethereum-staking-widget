import type { UseQueryResult } from '@tanstack/react-query';
import type { z } from 'zod';
import type {
  ManifestSchema,
  ManifestConfigWithdrawalDexes,
  ManifestConfigPages,
} from './validate';

export type Manifest = z.infer<typeof ManifestSchema>;

export type ManifestEntry = NonNullable<Manifest[keyof Manifest]>;

export type ManifestConfig = ManifestEntry['config'];

export type ManifestConfigVaultEntry =
  ManifestEntry['config']['earnVaults'][number];

export type ManifestConfigEarnVault = ManifestConfigVaultEntry['name'];

export type ManifestConfigVaultApyType =
  ManifestConfigVaultEntry['apy']['type'];

export type ManifestConfigPage =
  (typeof ManifestConfigPages)[keyof typeof ManifestConfigPages];

export type ManifestConfigDex =
  (typeof ManifestConfigWithdrawalDexes)[keyof typeof ManifestConfigWithdrawalDexes];

export type ExternalConfig = Omit<ManifestEntry, 'config'> &
  ManifestConfig & {
    fetchMeta: UseQueryResult<ManifestEntry>;
  };
