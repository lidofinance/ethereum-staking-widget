import {
  EARN_LEGACY_VAULTS,
  EarnVaultKey,
  EarnLegacyVaultKey,
} from 'features/earn/consts';

export const isLegacyVault = (
  vault: EarnVaultKey,
): vault is EarnLegacyVaultKey =>
  EARN_LEGACY_VAULTS.includes(vault as EarnLegacyVaultKey);
