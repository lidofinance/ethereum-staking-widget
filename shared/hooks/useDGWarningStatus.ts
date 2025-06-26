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

  const dgStatus = queryResult.data;
  const dgWarningState = dgStatus?.state ?? 'Unknown';
  const dgWarningStateOverriden = overrideWithQAMockString(
    featureFlags.dgWarningState ? 'Warning' : dgWarningState,
    'mock-qa-helpers-dg-state',
  ) as DGWarningState;

  const vetoSupportPercent = overrideWithQAMockNumber(
    dgStatus?.currentVetoSupportPercent ?? 0,
    'mock-qa-helpers-dg-current-veto-support-percent',
  );

  const isWarningState = dgWarningStateOverriden === 'Warning';
  const isBlockedState = dgWarningStateOverriden === 'Blocked';
  // we dont want to show banner if blocked state is true and currentVetoSupportPercent is not set
  const isDGActive =
    isWarningState || (isBlockedState && vetoSupportPercent > 0);

  return {
    vetoSupportPercent,
    isDGBannerEnabled,
    isDGActive,
    dgWarningState: dgWarningStateOverriden,
  };
};
