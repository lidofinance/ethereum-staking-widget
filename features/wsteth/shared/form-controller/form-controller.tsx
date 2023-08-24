import { useEffect, useMemo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useFormContext } from 'react-hook-form';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
import { useFormControllerContext } from './form-controller-context';

export const FormController: React.FC = ({ children }) => {
  const { active } = useWeb3();
  const { reset, handleSubmit } = useFormContext();
  const { onSubmit } = useFormControllerContext();
  const { dispatchModalState } = useTransactionModal();

  // Bind submit action
  const doSubmit = useMemo(
    () =>
      handleSubmit(async (args) => {
        const success = await onSubmit(args);
        if (success) reset();
      }),
    [handleSubmit, onSubmit, reset],
  );

  // Bind retry callback
  useEffect(() => {
    dispatchModalState({ type: 'set_on_retry', callback: doSubmit });
  }, [dispatchModalState, doSubmit]);

  // Reset form amount after disconnect wallet
  useEffect(() => {
    if (!active) reset();
  }, [active, reset]);

  return (
    <form autoComplete="off" onSubmit={doSubmit}>
      {children}
    </form>
  );
};
