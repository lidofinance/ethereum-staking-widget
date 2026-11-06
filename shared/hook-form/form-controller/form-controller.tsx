import { FC, useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { useFormControllerContext } from './form-controller-context';
import { useWagmiConnectionChangedCallback } from 'shared/hooks/use-wagmi-connection-changed-callback';

export const FormController: FC<React.ComponentProps<'form'>> = ({
  children,
  ...props
}) => {
  const { handleSubmit, reset: resetHookForm, getValues } = useFormContext();
  const {
    onSubmit,
    onReset: resetCustom,
    retryEvent,
    resetFormOn = 'all',
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
        // Reset from the live state, not the submitted snapshot: the form can
        // move while the tx is pending (an account switch resets it, a chain
        // switch may normalize a field) and the submission must not undo that
        if (success) reset(getValues());
      }),
    [handleSubmit, onSubmit, reset, getValues],
  );

  // Bind retry callback
  useEffect(() => {
    return retryEvent.subscribe(doSubmit);
  }, [retryEvent, doSubmit]);

  const resetWithValues = useCallback(() => {
    reset(getValues());
  }, [reset, getValues]);

  // Reset the form when chain id or wallet address changed or disconnected
  useWagmiConnectionChangedCallback(resetWithValues, resetFormOn);

  return (
    <form autoComplete="off" onSubmit={doSubmit} {...props}>
      {children}
    </form>
  );
};
