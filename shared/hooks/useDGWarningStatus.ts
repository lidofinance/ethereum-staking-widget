import { useQuery } from '@tanstack/react-query';
import { useConfig } from 'config/use-config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import {
  overrideWithQAMockBoolean,
  overrideWithQAMockNumber,
  overrideWithQAMockString,
} from 'utils/qa';

export type DGWarningState = 'Blocked' | 'Warning' | 'Unknown' | 'Normal';

export const useDGWarningStatus = (
  triggerPercent = 33,
): {
  vetoSupportPercent: number;
  isDGBannerEnabled: boolean;
  isDGActive: boolean;
  dgWarningState: DGWarningState;
} => {
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

  const dgWarningStatus = queryResult.data;
  const dgWarningOverrideState = overrideWithQAMockString(
    featureFlags.dgWarningState
      ? 'Warning'
      : dgWarningStatus?.state ?? 'Unknown',
    'mock-qa-helpers-dg-state',
  ) as DGWarningState;

  const vetoSupportOverridePercent = overrideWithQAMockNumber(
    dgWarningStatus?.currentVetoSupportPercent ?? 0,
    'mock-qa-helpers-dg-current-veto-support-percent',
  );

  const isWarningState = dgWarningOverrideState === 'Warning';
  const isBlockedState = dgWarningOverrideState === 'Blocked';
  // we dont want to show banner if blocked state is true and currentVetoSupportPercent is not set
  const isDGActive =
    isWarningState || (isBlockedState && vetoSupportOverridePercent > 0);

  return {
    vetoSupportPercent: vetoSupportOverridePercent,
    isDGBannerEnabled,
    isDGActive,
    dgWarningState: dgWarningOverrideState,
  };
};
