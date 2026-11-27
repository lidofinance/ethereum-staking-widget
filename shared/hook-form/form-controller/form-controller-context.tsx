import invariant from 'tiny-invariant';
import { createContext, useContext } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { EventSubscription } from 'utils/event-subscription';
import type { ResetMode } from 'shared/hooks/use-wagmi-connection-changed-callback';

// `F`: the field values (onReset reads them as they are). `S`: what
// onSubmit gets, the resolver's output, when it transforms the values
export type FormControllerContextValueType<
  F extends FieldValues = any,
  S extends FieldValues = F,
> = {
  isLocked?: boolean;
  onSubmit: (args: S) => Promise<boolean>;
  onReset?: (args: F) => void;
  retryEvent: EventSubscription;
  resetFormOn?: ResetMode;
};
/* @deprecated Use FormControllerProvider instead of directly using FormControllerContext */
export const FormControllerContext =
  createContext<FormControllerContextValueType | null>(null);
FormControllerContext.displayName = 'FormControllerContext';

export const FormControllerProvider = FormControllerContext.Provider;

export const useFormControllerContext = () => {
  const value = useContext(FormControllerContext);
  invariant(value, 'useFormControllerContext was used outside the provider');
  return value;
};
