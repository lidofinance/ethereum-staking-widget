import { useEffect, useRef } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

type UseRevalidateOnChangeArgs<T extends FieldValues> = {
  form: Pick<UseFormReturn<T>, 'watch' | 'trigger' | 'getFieldState'>;
  /** fields whose change can change the others' validity */
  sources: readonly Path<T>[];
  /** fields to re-validate then, e.g. an amount checked against a balance */
  targets: readonly Path<T>[];
};

/**
 * Re-validates `targets` when one of `sources` changes, however it changed
 * (user input, setValue, a controller).
 *
 * Why: RHF only updates the errors of the fields it validates, so a
 * cross-field error (amount vs the balance of the picked token) stays stale
 * after the token changes, and a stale VALIDATE error keeps submit disabled.
 * Only targets the user has seen are re-validated (dirty, touched or with an
 * error): an untouched field shows no error either way, and submit
 * validates everything anyway.
 */
export const useRevalidateOnChange = <T extends FieldValues>({
  form: { watch, trigger, getFieldState },
  sources,
  targets,
}: UseRevalidateOnChangeArgs<T>) => {
  // the lists are config: read the latest without resubscribing
  const fieldsRef = useRef({ sources, targets });
  fieldsRef.current = { sources, targets };

  useEffect(() => {
    const subscription = watch((_values, { name }) => {
      if (!name) return;
      const { sources, targets } = fieldsRef.current;
      const isSource = sources.some(
        (source) => name === source || name.startsWith(`${source}.`),
      );
      if (!isSource) return;

      const shown = targets.filter((target) => {
        const { isDirty, isTouched, error } = getFieldState(target);
        return isDirty || isTouched || !!error;
      });
      if (shown.length > 0) void trigger(shown);
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger, getFieldState]);
};
