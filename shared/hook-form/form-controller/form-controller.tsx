import { FC, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { useFormControllerContext } from './form-controller-context';
import { useWagmiConnectionChangedCallback } from 'shared/hooks/use-wagmi-connection-changed-callback';

type FormControllerProps = React.ComponentProps<'form'>;

export const FormController: FC<PropsWithChildren<FormControllerProps>> = ({
  children,
  ...props
}) => {
  const { handleSubmit, reset: resetHookForm, getValues } = useFormContext();
  const {
    onSubmit,
    onReset: resetCustom,
    retryEvent,
  } = useFormControllerContext();

  const reset = useMemo(() => {
    return resetCustom
      ? // for custom callback we provide current form values so that they can be used to build reset form state
        // e.g. leave selected token but reset amount
        resetCustom
      : // for default hook-form reset we shim the argument, because hook-form reset expects the new form values as argument
        // this resets form to default values provided to useForm
        () => resetHookForm();
  }, [resetCustom, resetHookForm]);

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
