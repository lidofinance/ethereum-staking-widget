import { z } from 'zod';

///
/// Earn
///

export const EarnVaultNameSchema = z.enum([
  'ggv',
  'dvv',
  'strategy',
  'eth',
  'usd',
]);

const EarnVaultConfigApyTypeSchema = z.enum([
  'daily',
  'weekly',
  'weekly_moving_average',
]);

const EarnVaultConfigApySchema = z.object({
  type: EarnVaultConfigApyTypeSchema.optional().default('weekly'),
});

const EarnVaultConfigApyEntrySchema = z.preprocess((obj) => {
  if (EarnVaultConfigApySchema.safeParse(obj).success) {
    return obj;
  }
  return undefined;
}, EarnVaultConfigApySchema);

const MAX_VAULT_TEXT_LENGTH = 250;

const EarnVaultConfigEntrySchema = z.object({
  name: EarnVaultNameSchema,
  apy: EarnVaultConfigApyEntrySchema.optional().default({
    type: 'weekly',
  }),
  // FLAGS
  deposit: z.boolean().optional().default(true),
  withdraw: z.boolean().optional().default(true),
  showNew: z.boolean().optional().default(false),
  deprecated: z.boolean().optional().default(false),
  disabled: z.boolean().optional().default(false),
  // Texts
  depositPauseReasonText: z.string().max(MAX_VAULT_TEXT_LENGTH).optional(),
  withdrawPauseReasonText: z.string().max(MAX_VAULT_TEXT_LENGTH).optional(),
  listWarningText: z.string().max(MAX_VAULT_TEXT_LENGTH).optional(),
});

// Filter out unknown vaults and vaults with invalid schema
const EarnVaultListSchema = z.preprocess(
  (obj) => {
    if (Array.isArray(obj)) {
      return obj.filter(
        (entry) => EarnVaultConfigEntrySchema.safeParse(entry).success,
      );
    }
    return obj;
  },
  z
    .array(EarnVaultConfigEntrySchema)
    .refine(
      (items) => new Set(items.map((item) => item.name)).size === items.length,
      {
        message: 'All items in the array must have unique names',
      },
    ),
);

//
// Earn Vault Banner
//

const EarnVaultsBannerSchema = z
  .object({
    showOnStakeForm: z.boolean().optional().default(false),
    showAfterStake: z.boolean().optional().default(false),
  })
  .optional()
  .default({
    showOnStakeForm: false,
    showAfterStake: false,
  });

//
// Earn allocation
//

const EarnAllocationLabelAllowListSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1)
      .regex(/^[^\s/]+$/u, 'Must contain a single label word'),
  )
  .transform((words) => [...new Set(words.map((word) => word.toLowerCase()))]);

const EarnAllocationHiddenIdsSchema = z
  .array(z.string().trim().min(1))
  .transform((ids) => [...new Set(ids)]);

const EarnAllocationSchema = z
  .object({
    labelAllowList: EarnAllocationLabelAllowListSchema.optional().default([]),
    hiddenIds: EarnAllocationHiddenIdsSchema.optional().default([]),
  })
  .optional()
  .default({ labelAllowList: [], hiddenIds: [] });

//
// Feature flags
//

const FeatureFlagsSchema = z
  .object({
    ledgerLiveL2: z.boolean(),
    disableSendCalls: z.boolean(),
    dgBannerEnabled: z.boolean(),
    dgWarningState: z.boolean(),
    rewardsMaintenance: z.boolean(),
    holidayDecorEnabled: z.boolean(),
    forceAllowance: z.boolean(),
    amountBannerEnabled: z.boolean(),
  })
  .partial();

//
// Withdrawal Dex
//

export const ManifestConfigWithdrawalDexIntegrations = {
  cowSwap: 'cowswap',
} as const;

export const ManifestConfigWithdrawalDexIntegrationsSchema = z.enum(
  Object.values(ManifestConfigWithdrawalDexIntegrations),
);

const DexWithdrawalIntegrationEntrySchema = z
  .preprocess(
    (obj) => {
      if (
        obj &&
        typeof obj === 'object' &&
        'integration' in obj &&
        ManifestConfigWithdrawalDexIntegrationsSchema.safeParse(obj.integration)
          .success
      ) {
        return obj;
      }
      // if we don't recognize the integration key, we disable it
      return {
        integration: 'cowswap' as const,
        enabled: false,
      };
    },
    z.object({
      integration: ManifestConfigWithdrawalDexIntegrationsSchema,
      enabled: z.boolean().optional().default(false),
    }),
  )
  .optional()
  .default({
    integration: 'cowswap',
    enabled: false,
  });

//
// Pages
//

export const ManifestConfigPages = {
  Stake: '/',
  Wrap: '/wrap',
  Withdrawals: '/withdrawals',
  Rewards: '/rewards',
  Settings: '/settings',
  Earn: '/earn',
} as const;

export const PageNameSchema = z.enum(Object.values(ManifestConfigPages));

const PageSchema = z.object({
  shouldDisable: z.boolean().optional().default(false),
  showNew: z.boolean().optional().default(false),
  sections: z.array(z.string()).optional().default([]),
});

const PagesEntrySchema = z
  .preprocess(
    (obj) => {
      if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
          Object.entries(obj).filter(
            ([key, value]) =>
              PageNameSchema.safeParse(key).success &&
              PageSchema.safeParse(value).success,
          ),
        );
      }
      return obj;
    },
    z.partialRecord(PageNameSchema, PageSchema),
  )
  .refine((pages) => {
    const stakePage = pages['/'];
    if (stakePage) {
      return !stakePage.shouldDisable;
    }
    return true;
  }, 'Stake page cannot be disabled');

//
// Api
//

const ApiSchema = z
  .object({
    validation: z
      .object({
        version: z.string(),
      })
      .partial(),
  })
  .partial();

//
// MultiChain Banner
//

const MultiChainBannerSchema = z
  .array(z.number().min(1))
  .refine((chainIds) => new Set(chainIds).size === chainIds.length, {
    message: 'Chain IDs in multiChainBanner must be unique',
  });

//
// Wallets
//

const WalletsConfigSchema = z
  .object({
    disabled: z.array(z.string()).optional().default([]),
  })
  .optional()
  .default({
    disabled: [],
  });

//
// Manifest Config
//

const ManifestConfigSchema = z.object({
  withdrawalDex: DexWithdrawalIntegrationEntrySchema,
  multiChainBanner: MultiChainBannerSchema.optional().default([]),
  featureFlags: FeatureFlagsSchema.optional().default({}),
  earnVaults: EarnVaultListSchema.optional().default([]),
  earnVaultsBanner: EarnVaultsBannerSchema,
  earnAllocation: EarnAllocationSchema,
  pages: PagesEntrySchema.optional().default({}),
  wallets: WalletsConfigSchema,
  api: ApiSchema.optional().default({}),
});

const MANIFEST_CONFIG_DEFAULT = ManifestConfigSchema.parse({});

//
// Manifest Entry
//

// Exported for the QA debug drawer manifest mock (config/external-config/qa-mock.ts)
export const ManifestEntrySchema = z.object({
  cid: z.string().optional(),
  ens: z.string().optional(),
  leastSafeVersion: z.string(),
  config: ManifestConfigSchema.optional().default(MANIFEST_CONFIG_DEFAULT),
});

//
// Manifest
//

const ManifestKeySchema = z
  .string()
  .regex(
    /^[1-9]\d*(?:-.+)?$/,
    "Must be a chain id or chain id with suffix (e.g. '1', '1-staging')",
  );

type UnknownRecord = Record<string, unknown>;

const isUnknownRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Objects are merged recursively, while arrays and primitive values from the
// network config replace their baseConfig counterparts. Object.fromEntries is
// used instead of property assignment so special keys cannot mutate a
// prototype while processing an untrusted remote manifest.
const mergeConfigValues = (base: unknown, override: unknown): unknown => {
  if (!isUnknownRecord(base) || !isUnknownRecord(override)) return override;

  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);

  return Object.fromEntries(
    [...keys].map((key) => {
      if (!Object.hasOwn(override, key)) return [key, base[key]];
      if (!Object.hasOwn(base, key)) return [key, override[key]];

      return [key, mergeConfigValues(base[key], override[key])];
    }),
  );
};

// A manifest contains one base config and any number of network entries whose
// config objects override it. ManifestKey mirrors the runtime key convention.
export type ManifestKey = `${number}` | `${number}-${string}`;
export type ManifestShape = Partial<
  Record<ManifestKey, z.infer<typeof ManifestEntrySchema>>
> & {
  baseConfig: z.infer<typeof ManifestConfigSchema>;
};

// Validation happens in two stages:
// 1. Keep baseConfig and valid chain keys, then merge baseConfig into every
//    chain config. Unknown top-level keys are ignored so older app versions can still parse
//    manifests extended with new top-level fields.
// 2. Validate baseConfig and each final chain config after merging.
//    Chain overrides may specify only changed fields, but the merged result
//    must still satisfy the complete config schema.
export const ManifestSchema = z.preprocess(
  (obj) => {
    if (isUnknownRecord(obj)) {
      const baseConfig = obj.baseConfig;

      return Object.fromEntries(
        Object.entries(obj)
          .filter(
            ([key]) =>
              key === 'baseConfig' || ManifestKeySchema.safeParse(key).success,
          )
          .map(([key, value]) => {
            if (key === 'baseConfig' || !isUnknownRecord(value)) {
              return [key, value];
            }

            return [
              key,
              {
                ...value,
                config: mergeConfigValues(
                  baseConfig,
                  Object.hasOwn(value, 'config') ? value.config : {},
                ),
              },
            ];
          }),
      );
    }
    return obj;
  },
  z.object({ baseConfig: ManifestConfigSchema }).catchall(ManifestEntrySchema),
) as z.ZodType<ManifestShape>;
