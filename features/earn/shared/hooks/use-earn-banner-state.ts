import { useConfig } from 'config/use-config';
import { useEarnState } from './use-earn-state';

export const useEarnBannerState = () => {
  const { externalConfig } = useConfig();

  // We specifically check for 'disabled' state because other states are 'enabled' and 'partial'.
  // We need to strictly hide the banner only when the state is 'disabled'.
  const { isEarnDisabled } = useEarnState();

  const showOnStakeForm =
    !isEarnDisabled &&
    (externalConfig.earnVaultsBanner?.showOnStakeForm ?? true);
  const showAfterStake =
    !isEarnDisabled &&
    (externalConfig.earnVaultsBanner?.showAfterStake ?? true);

  return { showOnStakeForm, showAfterStake };
};
