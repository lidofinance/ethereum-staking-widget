import { useQuery } from '@tanstack/react-query';
import { useConfig } from 'config/use-config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';

export const useDGWarningStatus = (triggerPercent = 33) => {
  const { dualGovernance } = useLidoSDK();

  // Use feature flags for testing states
  const { featureFlags } = useConfig().externalConfig;

  const isDGBannerEnabled = featureFlags.dgBannerEnabled;

  const queryResult = useQuery({
    queryKey: ['dgWarningStatus', triggerPercent],
    queryFn: async () => {
      return dualGovernance.getGovernanceWarningStatus({
        triggerPercent,
      });
    },
    enabled: isDGBannerEnabled,
    ...STRATEGY_LAZY,
  });

  const warningStatus = queryResult.data;

  return {
    state: warningStatus?.state,
    currentVetoSupportPercent: warningStatus?.currentVetoSupportPercent,
    isDGBannerEnabled,
    isWarningState:
      warningStatus?.state === 'Warning' || featureFlags.dgWarningState,
    isBlockedState:
      warningStatus?.state === 'Blocked' || featureFlags.dgBlockedState,
    isNormalState: warningStatus?.state === 'Normal',
    isUnknownState: warningStatus?.state === 'Unknown',
  };
};
