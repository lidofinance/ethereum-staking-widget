import { useConfig } from 'config/use-config';
import { useEarnState } from './use-earn-state';

export const useEarnBannerState = () => {
  const { externalConfig } = useConfig();
  const { isEarnEnabled } = useEarnState();

  const showOnStakeForm =
    isEarnEnabled && (externalConfig.earnVaultsBanner?.showOnStakeForm ?? true);
  const showAfterStake =
    isEarnEnabled && (externalConfig.earnVaultsBanner?.showAfterStake ?? true);

  return { showOnStakeForm, showAfterStake };
};
