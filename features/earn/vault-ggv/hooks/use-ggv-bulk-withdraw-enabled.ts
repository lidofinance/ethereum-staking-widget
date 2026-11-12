import { useConfig } from 'config';

// Remote flag. When on, GGV withdraws pay out WETH at once via Teller.bulkWithdraw.
export const useGGVBulkWithdrawEnabled = (): boolean => {
  const { featureFlags } = useConfig().externalConfig;
  return featureFlags.ggvBulkWithdrawEnabled === true;
};
