import { useWithdrawalsStatus } from 'features/withdrawals/hooks';
import { StatusProps } from 'features/withdrawals/shared/status';

export const useContractStatus = () => {
  const {
    isBunkerMode,
    isPaused,
    isLoading: isWthdrawalsStatusLoading,
  } = useWithdrawalsStatus();

  const withdrawalsStatus: StatusProps['variant'] = isPaused
    ? 'error'
    : isBunkerMode
    ? 'warning'
    : 'success';

  return {
    withdrawalsStatus,
    isWthdrawalsStatusLoading,
    isBunkerMode,
    isPaused,
  };
};
