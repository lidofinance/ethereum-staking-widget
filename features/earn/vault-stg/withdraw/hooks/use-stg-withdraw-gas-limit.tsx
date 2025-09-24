import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSTGWithdrawForm } from '../form-context';
import type { STGWithdrawFormValues } from '../form-context/types';

// Placeholder for STG withdraw gas limit estimation
export const useSTGWithdrawEthGasLimit = () => {
  const { watch } = useFormContext<STGWithdrawFormValues>();
  const { isLoading } = useSTGWithdrawForm();

  const amount = watch('amount');

  const gasLimit = useMemo(() => {
    // TODO: Implement actual gas limit estimation for STG withdrawal
    // This would typically estimate gas based on:
    // 1. The withdrawal amount
    // 2. Current network conditions
    // 3. Contract gas requirements

    if (!amount || isLoading) {
      return undefined;
    }

    // Placeholder estimation - typically withdrawal operations require more gas
    return 150000n; // Example gas limit for withdrawal
  }, [amount, isLoading]);

  return {
    gasLimit,
    isLoading,
  };
};
