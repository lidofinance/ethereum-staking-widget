import { useWithdrawalsBaseData } from 'features/withdrawals/hooks';
import { StatusProps } from 'features/withdrawals/shared/status';

export const useContractStatus = () => {
  const wqBaseData = useWithdrawalsBaseData();

  const { isBunker, isPaused, isTurbo } = wqBaseData.data ?? {};

  const withdrawalsStatus: StatusProps['variant'] = isPaused
    ? 'error'
    : isBunker
    ? 'warning'
    : isTurbo
    ? 'success'
    : 'error';

  return {
    withdrawalsStatus,
    isWithdrawalsStatusLoading: wqBaseData.initialLoading,
    isBunker,
    isPaused,
    isTurbo,
  };
};
