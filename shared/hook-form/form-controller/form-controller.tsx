import { FC, PropsWithChildren, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { useFormControllerContext } from './form-controller-context';

type FormControllerProps = React.ComponentProps<'form'>;

export const FormController: FC<PropsWithChildren<FormControllerProps>> = ({
  children,
  ...props
}) => {
  const { isDappActive } = useDappStatus();
  const { handleSubmit, reset: resetDefault } = useFormContext();
  const {
    onSubmit,
    onReset: resetContext,
    retryEvent,
  } = useFormControllerContext();

  // Bind submit action
  const doSubmit = useMemo(
    () =>
      handleSubmit(async (args) => {
        const success = await onSubmit(args);
        if (success) resetContext ? resetContext(args) : resetDefault();
      }),
    [handleSubmit, onSubmit, resetDefault, resetContext],
  );

  // Bind retry callback
  useEffect(() => {
    return retryEvent.subscribe(doSubmit);
  }, [retryEvent, doSubmit]);

  // Reset form amount after disconnect wallet
  useEffect(() => {
    if (!isDappActive) resetDefault();
    // reset will be captured when active changes
    // so we don't need it in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDappActive]);

  return (
    <form autoComplete="off" onSubmit={doSubmit} {...props}>
      {children}
    </form>
  );
};
