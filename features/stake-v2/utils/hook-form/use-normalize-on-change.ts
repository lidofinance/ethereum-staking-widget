import { useEffect, useRef } from 'react';
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from 'react-hook-form';

type UseNormalizeOnChangeArgs<T extends FieldValues, N extends Path<T>> = {
  form: Pick<UseFormReturn<T>, 'watch' | 'getValues' | 'setValue'>;
  /** fields whose change can make `field` invalid */
  sources: readonly Path<T>[];
  field: N;
  /**
   * `field`'s fixed value for the current values; the same value (same
   * object) when it is fine. Keep it memoized: a new function re-applies.
   */
  normalize: (values: T) => PathValue<T, N>;
};

/**
 * Keeps a field consistent with others, e.g. tokenOut one tokenIn can
 * stake into: re-applied when a source changes and when `normalize` itself
 * changes (its data loaded). Sets the field, and validates, only when the
 * fixed value differs, so it cannot loop.
 */
export const useNormalizeOnChange = <T extends FieldValues, N extends Path<T>>({
  form: { watch, getValues, setValue },
  sources,
  field,
  normalize,
}: UseNormalizeOnChangeArgs<T, N>) => {
  const argsRef = useRef({ sources, field, normalize });
  argsRef.current = { sources, field, normalize };

  useEffect(() => {
    const apply = () => {
      const { field, normalize } = argsRef.current;
      const current = getValues(field);
      const next = normalize(getValues());
      if (next !== current) setValue(field, next, { shouldValidate: true });
    };
    apply();
    const subscription = watch((_values, { name }) => {
      if (!name) return;
      const isSource = argsRef.current.sources.some(
        (source) => name === source || name.startsWith(`${source}.`),
      );
      if (isSource) apply();
    });
    return () => subscription.unsubscribe();
    // re-applied when normalize changes; the rest is read from the ref
  }, [watch, getValues, setValue, normalize]);
};
