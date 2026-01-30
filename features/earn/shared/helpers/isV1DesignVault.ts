import {
  EARN_VAULTS_V1_DESIGN,
  EarnVaultKey,
  EarnVaultV1DesignKey,
} from 'features/earn/consts';

export const isV1DesignVault = (
  vault: EarnVaultKey,
): vault is EarnVaultV1DesignKey => {
  return EARN_VAULTS_V1_DESIGN.includes(vault as EarnVaultV1DesignKey);
};
