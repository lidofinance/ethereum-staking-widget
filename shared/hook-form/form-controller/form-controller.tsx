import { FC, PropsWithChildren, useEffect, useMemo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { UseFormReset, useFormContext } from 'react-hook-form';
import { useTransactionModal } from 'shared/transaction-modal';
import { useFormControllerContext } from './form-controller-context';

type FormControllerProps = {
  reset?: UseFormReset<Record<string, any>>;
} & React.ComponentProps<'form'>;

export const FormController: FC<PropsWithChildren<FormControllerProps>> = ({
  reset: resetProp,
  children,
  ...props
}) => {
  const { active } = useWeb3();
  const { handleSubmit, reset: resetDefault } = useFormContext();
  const { onSubmit } = useFormControllerContext();
  const { dispatchModalState } = useTransactionModal();

  const reset = resetProp ?? resetDefault;

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
    // reset will be captured when active changes
    // so we don't need it in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <form autoComplete="off" onSubmit={doSubmit} {...props}>
      {children}
    </form>
  );
};
