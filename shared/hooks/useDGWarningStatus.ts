import { useQuery } from '@tanstack/react-query';
import { useConfig } from 'config/use-config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import {
  overrideWithQAMockBoolean,
  overrideWithQAMockNumber,
  overrideWithQAMockString,
} from 'utils/qa';

export type DGState = 'Blocked' | 'Warning' | 'Unknown' | 'Normal';

export const useDGWarningStatus = (
  triggerPercent = 33,
): {
  currentVetoSupportPercent: number;
  isDGBannerEnabled: boolean;
  isDGActive: boolean;
  dgStatus: DGState;
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
  const dgOverrideState = overrideWithQAMockString(
    featureFlags.dgWarningState
      ? 'Warning'
      : dgWarningStatus?.state ?? 'Unknown',
    'mock-qa-helpers-dg-state',
  ) as DGState;

  const currentVetoSupportPercent = overrideWithQAMockNumber(
    dgWarningStatus?.currentVetoSupportPercent ?? 0,
    'mock-qa-helpers-dg-current-veto-support-percent',
  );

  const isWarningState = dgOverrideState === 'Warning';
  const isBlockedState = dgOverrideState === 'Blocked';
  // we dont want to show banner if blocked state is true and currentVetoSupportPercent is not set
  const isDGActive =
    isWarningState || (isBlockedState && currentVetoSupportPercent > 0);

  return {
    currentVetoSupportPercent,
    isDGBannerEnabled,
    isDGActive,
    dgStatus: dgOverrideState,
  };
};
