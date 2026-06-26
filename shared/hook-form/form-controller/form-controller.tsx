import { FC, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { useFormControllerContext } from './form-controller-context';
import { useWagmiConnectionChangedCallback } from 'shared/hooks/use-wagmi-connection-changed-callback';

type FormControllerProps = React.ComponentProps<'form'>;

export const FormController: FC<PropsWithChildren<FormControllerProps>> = ({
  children,
  ...props
}) => {
  const { handleSubmit, reset: resetDefault, getValues } = useFormContext();
  const {
    onSubmit,
    onReset: resetContext,
    retryEvent,
  } = useFormControllerContext();

  const reset = useMemo(() => {
    return resetContext ? resetContext : resetDefault;
  }, [resetContext, resetDefault]);

  // Bind submit action
  const doSubmit = useMemo(
    () =>
      handleSubmit(async (args) => {
        const success = await onSubmit(args);
        if (success) reset(args);
      }),
    [handleSubmit, onSubmit, reset],
  );

  // Bind retry callback
  useEffect(() => {
    return retryEvent.subscribe(doSubmit);
  }, [retryEvent, doSubmit]);

  const resetWithValues = useCallback(() => {
    reset(getValues());
  }, [reset, getValues]);

  // Reset the form when chain id or wallet address changed or disconnected
  useWagmiConnectionChangedCallback(resetWithValues);

  return (
    <form autoComplete="off" onSubmit={doSubmit} {...props}>
      {children}
    </form>
  );
};
