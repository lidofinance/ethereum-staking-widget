import type { UseQueryResult } from '@tanstack/react-query';
import type { z } from 'zod';
import type { ManifestSchema } from './validate';

export type Manifest = z.infer<typeof ManifestSchema>;

export type ManifestEntry = NonNullable<Manifest[keyof Manifest]>;

export type ManifestConfig = ManifestEntry['config'];

export type EarnVaultConfigEntry =
  ManifestEntry['config']['earnVaults'][number];

export type VaultAPYType = EarnVaultConfigEntry['apy']['type'];

export enum ManifestConfigPageEnum {
  Stake = '/',
  Wrap = '/wrap',
  Withdrawals = '/withdrawals',
  Rewards = '/rewards',
  Settings = '/settings',
  Referral = '/referral',
  Earn = '/earn',
  EarnNew = '/earn-new',
}

export const ManifestConfigPageList = new Set<ManifestConfigPage>(
  Object.values(ManifestConfigPageEnum),
);

export type ManifestConfigPage = `${ManifestConfigPageEnum}`;

export type ExternalConfig = Omit<ManifestEntry, 'config'> &
  ManifestConfig & {
    fetchMeta: UseQueryResult<ManifestEntry>;
  };
