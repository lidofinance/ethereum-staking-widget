import { useQuery } from '@tanstack/react-query';
import { useConfig } from 'config/use-config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import { overrideWithQAMockBoolean, overrideWithQAMockNumber } from 'utils/qa';

export const useDGWarningStatus = (triggerPercent = 33) => {
  const { dualGovernance } = useLidoSDK();

  // Use feature flags for testing states
  const { featureFlags } = useConfig().externalConfig;

  const isDGBannerEnabled = overrideWithQAMockBoolean(
    Boolean(featureFlags.dgBannerEnabled),
    'mock-qa-helpers-dg-banner-enabled',
  );

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

  const isWarningState = overrideWithQAMockBoolean(
    warningStatus?.state === 'Warning' || Boolean(featureFlags.dgWarningState),
    'mock-qa-helpers-dg-warning-state',
  );

  const isBlockedState = overrideWithQAMockBoolean(
    warningStatus?.state === 'Blocked',
    'mock-qa-helpers-dg-blocked-state',
  );

  const currentVetoSupportPercent = overrideWithQAMockNumber(
    warningStatus?.currentVetoSupportPercent ?? 0,
    'mock-qa-helpers-dg-current-veto-support-percent',
  );

  return {
    state: warningStatus?.state,
    currentVetoSupportPercent,
    isDGBannerEnabled,
    isWarningState,
    isBlockedState,
    isNormalState: warningStatus?.state === 'Normal',
    isUnknownState: warningStatus?.state === 'Unknown',
  };
};
