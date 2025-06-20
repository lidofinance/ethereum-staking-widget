import { useQuery } from '@tanstack/react-query';
import { useConfig } from 'config/use-config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';

export const useDGWarningStatus = (triggerPercent = 33) => {
  const { dualGovernance } = useLidoSDK();

  // Use feature flags for testing states
  const { featureFlags } = useConfig().externalConfig;

  const queryResult = useQuery({
    queryKey: ['dgWarningStatus', triggerPercent],
    queryFn: async () => {
      return dualGovernance.getGovernanceWarningStatus({
        triggerPercent,
      });
    },
    ...STRATEGY_LAZY,
  });

  const warningStatus = queryResult.data;

  const isNormalState = warningStatus?.state === 'Normal';
  const isWarningState =
    warningStatus?.state === 'Warning' || featureFlags.dgWarningState;
  const isBlockedState =
    warningStatus?.state === 'Blocked' || featureFlags.dgBlockedState;
  const isUnknownState = warningStatus?.state === 'Unknown';

  return {
    state: warningStatus?.state,
    currentVetoSupportPercent: warningStatus?.currentVetoSupportPercent,
    isWarningState,
    isBlockedState,
    isNormalState,
    isUnknownState,
  };
};
