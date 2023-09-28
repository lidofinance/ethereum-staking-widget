import { FC, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useFormContext } from 'react-hook-form';
import { useTransactionModal } from 'shared/transaction-modal';
import { useFormControllerContext } from './form-controller-context';

type FormControllerProps = {
  reset?: () => void;
};

export const FormController: FC<PropsWithChildren<FormControllerProps>> = ({
  reset: resetProp,
  children,
}) => {
  const { active } = useWeb3();
  const { handleSubmit, reset: resetDefault } = useFormContext();
  const { onSubmit } = useFormControllerContext();
  const { dispatchModalState } = useTransactionModal();

  const reset = useCallback(() => {
    if (resetProp) {
      resetProp();
    } else {
      resetDefault();
    }
  }, [resetDefault, resetProp]);

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
