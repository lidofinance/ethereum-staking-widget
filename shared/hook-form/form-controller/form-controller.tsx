import {
  FC,
  useCallback,
  useEffect,
  useRef,
  type BaseSyntheticEvent,
} from 'react';
import { useFormContext } from 'react-hook-form';

import { useFormControllerContext } from './form-controller-context';
import { useWagmiConnectionChangedCallback } from 'shared/hooks/use-wagmi-connection-changed-callback';

export const FormController: FC<React.ComponentProps<'form'>> = ({
  children,
  ...props
}) => {
  const {
    handleSubmit,
    reset,
    getValues,
    formState: { disabled },
  } = useFormContext();
  const {
    onSubmit,
    onReset,
    retryEvent,
    resetFormOn = 'all',
  } = useFormControllerContext();
  // Keep lifecycle and disabled state current while asynchronous validation runs.
  const submissionState = useRef({ mounted: true, disabled });
  submissionState.current.disabled = disabled;

  useEffect(() => {
    const state = submissionState.current;
    state.mounted = true;
    return () => {
      state.mounted = false;
    };
  }, []);

  const resetForm = useCallback(() => {
    // Read current values: the form may change while a transaction is pending.
    if (onReset) onReset(getValues());
    else reset();
  }, [onReset, getValues, reset]);

  const submit = useCallback(
    async (event?: BaseSyntheticEvent): Promise<boolean> => {
      if (
        !submissionState.current.mounted ||
        submissionState.current.disabled
      ) {
        event?.preventDefault?.();
        return false;
      }

      return (
        (await handleSubmit(async (values) => {
          // Validation may await network data; the form can disappear or be disabled.
          if (
            !submissionState.current.mounted ||
            submissionState.current.disabled
          )
            return false;
          const success = await onSubmit(values);
          if (success) resetForm();
          return success;
        })(event)) ?? false
      );
    },
    [handleSubmit, onSubmit, resetForm],
  );

  useEffect(() => retryEvent.subscribe(submit), [retryEvent, submit]);
  useWagmiConnectionChangedCallback(resetForm, resetFormOn);

  return (
    <form autoComplete="off" onSubmit={submit} {...props}>
      {children}
    </form>
  );
};
