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
// Enabled Withdrawal Dexes
//

export const ManifestConfigWithdrawalDexes = {
  paraswap: 'paraswap',
  openOcean: 'open-ocean',
  oneInch: 'one-inch',
  bebop: 'bebop',
  jumper: 'jumper',
} as const;

export const DexWithdrawalsApiSchema = z.enum(
  Object.values(ManifestConfigWithdrawalDexes),
);

// Filter out unknown dexes
const EnabledWithdrawalDexesSchema = z.preprocess(
  (obj) => {
    if (Array.isArray(obj)) {
      return obj.filter(
        (dex) => DexWithdrawalsApiSchema.safeParse(dex).success,
      );
    }
    return obj;
  },
  z
    .array(DexWithdrawalsApiSchema)
    .refine((items) => new Set(items).size === items.length, {
      message: 'All items in the array must be unique',
    }),
);

//
// Pages
//

export const ManifestConfigPages = {
  Stake: '/',
  Wrap: '/wrap',
  Withdrawals: '/withdrawals',
  Rewards: '/rewards',
  Settings: '/settings',
  Referral: '/referral',
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
// Manifest Config
//

const ManifestConfigSchema = z.object({
  enabledWithdrawalDexes: EnabledWithdrawalDexesSchema.optional().default([]),
  multiChainBanner: MultiChainBannerSchema.optional().default([]),
  featureFlags: FeatureFlagsSchema.optional().default({}),
  earnVaults: EarnVaultListSchema.optional().default([]),
  earnVaultsBanner: EarnVaultsBannerSchema,
  pages: PagesEntrySchema.optional().default({}),
  api: ApiSchema.optional().default({}),
});

const MANIFEST_CONFIG_DEFAULT = ManifestConfigSchema.parse({});

//
// Manifest Entry
//

const ManifestEntrySchema = z.object({
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

// Filter out keys that do not match key schema
// this allows us to be forward-compatible with possible new values in manifest
export const ManifestSchema = z.preprocess(
  (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).filter(
          ([key]) => ManifestKeySchema.safeParse(key).success,
        ),
      ) as Record<
        z.infer<typeof ManifestKeySchema>,
        z.infer<typeof ManifestEntrySchema>
      >;
    }
    return obj;
  },
  z.partialRecord(ManifestKeySchema, ManifestEntrySchema),
);
