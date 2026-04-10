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

// Severity order: Normal < Unknown < Warning < Blocked
const DG_STATE_ORDER: DGWarningState[] = [
  'Normal',
  'Unknown',
  'Warning',
  'Blocked',
];

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

  // SECURITY: QA overrides below can only escalate warnings, never suppress
  // them. This prevents hiding governance alerts if QA localStorage keys
  // leak to production.

  // QA can only enable the banner, not disable it
  const isDGBannerEnabled =
    Boolean(featureFlags.dgBannerEnabled) ||
    overrideWithQAMockBoolean(false, 'mock-qa-helpers-dg-banner-enabled');

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
  const realState: DGWarningState = featureFlags.dgWarningState
    ? 'Warning'
    : (dgStatus?.state ?? 'Unknown');
  // QA can only escalate severity (e.g. Normal→Warning OK, Warning→Normal NO)
  const qaState = overrideWithQAMockString(
    realState,
    'mock-qa-helpers-dg-state',
  ) as DGWarningState;
  const dgWarningStateOverriden =
    DG_STATE_ORDER.indexOf(qaState) >= DG_STATE_ORDER.indexOf(realState)
      ? qaState
      : realState;

  // QA can only increase veto support (show more alarm), not decrease
  const realPercent = dgStatus?.currentVetoSupportPercent ?? 0;
  const vetoSupportPercent = Math.max(
    realPercent,
    overrideWithQAMockNumber(
      realPercent,
      'mock-qa-helpers-dg-current-veto-support-percent',
    ),
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
