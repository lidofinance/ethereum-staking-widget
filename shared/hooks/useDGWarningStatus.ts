import { useQuery } from '@tanstack/react-query';
import { useConfig } from 'config/use-config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import {
  overrideWithQAMockBoolean,
  overrideWithQAMockNumber,
  overrideWithQAMockString,
} from 'utils/qa';

export type DGStatus = 'Blocked' | 'Warning' | 'Unknown' | 'Normal';

export const useDGWarningStatus = (
  triggerPercent = 33,
): {
  currentVetoSupportPercent: number;
  isDGBannerEnabled: boolean;
  isDGActive: boolean;
  dgStatus: DGStatus;
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

  const dgStatus = queryResult.data;
  const dgOverrideStatus = overrideWithQAMockString(
    featureFlags.dgWarningState ? 'Warning' : dgStatus?.state ?? 'Unknown',
    'mock-qa-helpers-dg-status',
  ) as DGStatus;

  const currentVetoSupportPercent = overrideWithQAMockNumber(
    dgStatus?.currentVetoSupportPercent ?? 0,
    'mock-qa-helpers-dg-current-veto-support-percent',
  );

  const isWarningState = dgOverrideStatus === 'Warning';
  const isBlockedState = dgOverrideStatus === 'Blocked';
  // we dont want to show banner if blocked state is true and currentVetoSupportPercent is not set
  const isDGActive =
    isWarningState || (isBlockedState && currentVetoSupportPercent > 0);

  return {
    currentVetoSupportPercent,
    isDGBannerEnabled,
    isDGActive,
    dgStatus: dgOverrideStatus,
  };
};
