// Single source of truth for QA-helper localStorage overrides.
// Overrides are read via `utils/qa.ts` (or direct localStorage reads at the
// call sites listed below) and are active only when `config.enableQaHelpers`
// is true. Keys are a contract with QA — do not rename existing ones.

export const QA_KEYS = {
  // analytics
  matomoLogging: 'mock-qa-helpers-matomo-logging',
  // ipfs / infra security banner
  securityBannerIsUpdateAvailable:
    'mock-qa-helpers-security-banner-is-update-available',
  securityBannerIsVersionUnsafe:
    'mock-qa-helpers-security-banner-is-version-unsafe',
  securityBannerIsNotVerifiable:
    'mock-qa-helpers-security-banner-is-not-verifiable',
  // Testing environment banner (shared/components/layout/test-env-banner.tsx)
  testEnvBanner: 'mock-qa-helpers-show-test-env-banner',
  // dual governance banner
  dgBannerEnabled: 'mock-qa-helpers-dg-banner-enabled',
  dgState: 'mock-qa-helpers-dg-state',
  dgVetoSupportPercent: 'mock-qa-helpers-dg-current-veto-support-percent',
  // stake swap-discount banner
  discountRate: 'mock-qa-helpers-discount-rate',
  // earn
  earnEthUpgradeAmount: 'mock-qa-helpers-earn-eth-upgrade-amount',
  mellowSyncRedeemRemainingDailyLimit:
    'mock-qa-helpers-mellow-sync-redeem-remaining-daily-limit',
  mellowSyncRedeemLiquidAssets:
    'mock-qa-helpers-mellow-sync-redeem-liquid-assets',
  // CoW trade guard (overrides can only tighten protection, never relax it)
  tradeGuardLevel: 'mock-qa-helpers-trade-guard-level',
  tradeGuardOracleBlock: 'mock-qa-helpers-trade-guard-oracle-block',
  tradeGuardMaxSell: 'mock-qa-helpers-trade-guard-max-sell',
  tradeGuardMinSell: 'mock-qa-helpers-trade-guard-min-sell',
  // amount banners (legacy key names, predate the mock-qa-helpers prefix)
  amountBannerBalance: 'mockAmountBannerStethBalance',
  amountBannerThreshold1: 'mockAmountBannerStethBalanceThreshold1',
  amountBannerThreshold2: 'mockAmountBannerStethBalanceThreshold2',
  amountBannerThreshold3: 'mockAmountBannerStethBalanceThreshold3',
  // stake limit (legacy key names)
  stakeLimitReached: 'mockLimitReached',
  stakeLimitFullInfo: 'getStakeLimitFullInfo',
  // external config (manifest) mock — custom drawer section, zod-validated
  // overlay in config/external-config/qa-mock.ts
  externalConfigMockEnabled: 'mock-qa-helpers-external-config-enabled',
  externalConfigMock: 'mock-qa-helpers-external-config',
} as const;

export type QaKey = (typeof QA_KEYS)[keyof typeof QA_KEYS];

// Keys with dedicated drawer UI — intentionally absent from QA_MOCK_GROUPS.
export const QA_CUSTOM_UI_KEYS: QaKey[] = [
  QA_KEYS.matomoLogging,
  QA_KEYS.externalConfigMockEnabled,
  QA_KEYS.externalConfigMock,
];

type QaMockControl =
  // read via overrideWithQAMockBoolean ('true'/'false')
  | { type: 'boolean' }
  // read via overrideWithQAMockNumber
  | { type: 'number' }
  // decimal ETH string, read via overrideWithQAMockEther
  | { type: 'ether' }
  // raw wei string, read via overrideWithQAMockBigInt
  | { type: 'bigint' }
  // read via overrideWithQAMockString, restricted to options
  | { type: 'enum'; options: readonly string[] }
  // JSON string, parsed at the call site
  | { type: 'json' };

export type QaMockDescriptor = {
  key: QaKey;
  label: string;
  description?: string;
} & QaMockControl;

export type QaMockGroup = {
  title: string;
  mocks: QaMockDescriptor[];
};

export const QA_MOCK_GROUPS: QaMockGroup[] = [
  {
    title: 'Security banner (IPFS / infra)',
    mocks: [
      {
        key: QA_KEYS.securityBannerIsUpdateAvailable,
        label: 'Force "update available"',
        type: 'boolean',
      },
      {
        key: QA_KEYS.securityBannerIsVersionUnsafe,
        label: 'Force "version unsafe"',
        description: 'Also disconnects the wallet and blocks connection',
        type: 'boolean',
      },
      {
        key: QA_KEYS.securityBannerIsNotVerifiable,
        label: 'Force "not verifiable"',
        type: 'boolean',
      },
    ],
  },
  {
    title: 'Dual governance banner',
    mocks: [
      {
        key: QA_KEYS.dgBannerEnabled,
        label: 'DG banner enabled',
        type: 'boolean',
      },
      {
        key: QA_KEYS.dgState,
        label: 'DG warning state',
        type: 'enum',
        options: ['Normal', 'Warning', 'Blocked', 'Unknown'],
      },
      {
        key: QA_KEYS.dgVetoSupportPercent,
        label: 'Veto support, %',
        type: 'number',
      },
    ],
  },
  {
    title: 'Stake',
    mocks: [
      {
        key: QA_KEYS.discountRate,
        label: 'Swap discount rate',
        description: 'ETH→stETH rate; banner shows when above 1.004',
        type: 'number',
      },
      {
        key: QA_KEYS.stakeLimitReached,
        label: 'Stake limit reached',
        description: 'Throws MockLimitReachedError on stake/wrap tx',
        type: 'boolean',
      },
      {
        key: QA_KEYS.stakeLimitFullInfo,
        label: 'getStakeLimitFullInfo mock',
        description:
          'JSON, e.g. {"isStakingPaused":false,"isStakingLimitSet":true,"currentStakeLimit":"100","maxStakeLimit":"150"} (ETH units)',
        type: 'json',
      },
    ],
  },
  {
    title: 'Amount banners',
    mocks: [
      {
        key: QA_KEYS.amountBannerBalance,
        label: 'Effective amount, ETH',
        type: 'ether',
      },
      {
        key: QA_KEYS.amountBannerThreshold1,
        label: 'Threshold 1, ETH',
        type: 'ether',
      },
      {
        key: QA_KEYS.amountBannerThreshold2,
        label: 'Threshold 2, ETH',
        type: 'ether',
      },
      {
        key: QA_KEYS.amountBannerThreshold3,
        label: 'Threshold 3, ETH',
        type: 'ether',
      },
    ],
  },
  {
    title: 'Earn',
    mocks: [
      {
        key: QA_KEYS.earnEthUpgradeAmount,
        label: 'EarnETH upgrade amount, wei',
        type: 'bigint',
      },
      {
        key: QA_KEYS.mellowSyncRedeemRemainingDailyLimit,
        label: 'Mellow sync-redeem remaining daily limit, wei',
        type: 'bigint',
      },
      {
        key: QA_KEYS.mellowSyncRedeemLiquidAssets,
        label: 'Mellow sync-redeem liquid assets, wei',
        type: 'bigint',
      },
    ],
  },
  {
    title: 'CoW trade guard',
    mocks: [
      {
        key: QA_KEYS.tradeGuardLevel,
        label: 'Guard level',
        description: 'Can only escalate severity (safe→blocked), never relax',
        type: 'enum',
        options: ['safe', 'blocked'],
      },
      {
        key: QA_KEYS.tradeGuardOracleBlock,
        label: 'Oracle deviation block threshold',
        description: 'Clamped: only lower (stricter) than default 4',
        type: 'number',
      },
      {
        key: QA_KEYS.tradeGuardMaxSell,
        label: 'Max allowed sell amount',
        description: 'Clamped: only lower (stricter) than default 5000',
        type: 'number',
      },
      {
        key: QA_KEYS.tradeGuardMinSell,
        label: 'Min sell units to trigger oracle',
        description: 'Clamped: only lower (stricter) than default 0.5',
        type: 'number',
      },
    ],
  },
  {
    title: 'Testing environment banner',
    mocks: [
      {
        key: QA_KEYS.testEnvBanner,
        label: 'Testing environment banner',
        description: 'Indicates if the testing environment banner is shown',
        type: 'boolean',
      },
    ],
  },
];
