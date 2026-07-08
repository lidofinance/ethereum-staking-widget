import invariant from 'tiny-invariant';
import { createContext, useContext } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { EventSubscription } from 'utils/event-subscription';

export type FormControllerContextValueType<F extends FieldValues = any> = {
  isLocked?: boolean;
  onSubmit: (args: F) => Promise<boolean>;
  onReset?: (args: F) => void;
  retryEvent: EventSubscription;
};

export const FormControllerContext =
  createContext<FormControllerContextValueType | null>(null);
FormControllerContext.displayName = 'FormControllerContext';

export const useFormControllerContext = () => {
  const value = useContext(FormControllerContext);
  invariant(value, 'useFormControllerContext was used outside the provider');
  return value;
};
