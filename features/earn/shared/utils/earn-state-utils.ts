export const EARN_STATES = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  PARTIAL: 'partial',
} as const;

type EarnStateKey = keyof typeof EARN_STATES;
export type EarnStateValue = (typeof EARN_STATES)[EarnStateKey];

export const EARN_STATE_KEYWORDS = [
  EARN_STATES.ENABLED,
  EARN_STATES.DISABLED,
] as const;

/**
 * Pure function that computes earn runtime state from inputs.
 * Extracted for testability.
 *
 * Opt-out semantics:
 * - Earn is ENABLED by default for all integrations.
 * - Ledger Live is always disabled (cannot be overridden via URL).
 * - URL parameter `?earn=disabled` disables earn globally.
 * - URL parameter `?earn=vault1,vault2` shows ONLY those vaults (allowlist); others are hidden.
 * - URL parameter `?earn=enabled` is a no-op (earn is already enabled by default).
 */
export const computeEarnRuntimeState = ({
  isLedgerLive,
  earnParam,
  isReady,
}: {
  isLedgerLive: boolean;
  earnParam: string | undefined;
  isReady: boolean;
}) => {
  // Parse allowlisted vaults from URL param: ?earn=vault1,vault2
  // Only those vaults will be shown; the rest will be hidden (PARTIAL state)
  let vaultsEnabledByUrl: string[] = [];
  if (
    isReady &&
    earnParam &&
    typeof earnParam === 'string' &&
    !EARN_STATE_KEYWORDS.includes(earnParam as any) // Only treat as vault names if it's not a keyword (enabled/disabled)
  ) {
    vaultsEnabledByUrl = earnParam.split(',');
  }

  const someVaultsEnabledByURL = vaultsEnabledByUrl.length > 0;
  const isEarnDisabledByURL = isReady && earnParam === EARN_STATES.DISABLED;

  // Earn is disabled by runtime context if:
  // 1. We're in Ledger Live (always disabled, cannot be overridden via URL)
  // 2. Earn is explicitly disabled via URL (?earn=disabled)
  const isEarnDisabledByRuntimeContext = isLedgerLive || isEarnDisabledByURL;

  const isVaultEnabledByUrl = (vaultName: string) =>
    vaultsEnabledByUrl.includes(vaultName);

  const isVaultDisabledByUrl = (vaultName: string) =>
    !isVaultEnabledByUrl(vaultName);

  return {
    isEarnDisabledByRuntimeContext,
    someVaultsEnabledByURL,
    vaultsEnabledByUrl,
    isVaultEnabledByUrl,
    isVaultDisabledByUrl,
  };
};
