type WithFallbackOptions = {
  onError?: (error: unknown) => void;
};

// Awaits a promise and resolves with the fallback (undefined by default)
// instead of rejecting — for reads whose failure must not fail the caller.
// Only a rejection is caught: a synchronous throw while building the promise
// argument happens before this is called.
// Overloaded so the fallback type can only come from a fallback that was
// actually passed.
export function withFallback<T>(
  promise: Promise<T>,
  fallback?: undefined,
  options?: WithFallbackOptions,
): Promise<T | undefined>;
export function withFallback<T, F>(
  promise: Promise<T>,
  fallback: F,
  options?: WithFallbackOptions,
): Promise<T | F>;
export async function withFallback<T, F>(
  promise: Promise<T>,
  fallback?: F,
  { onError }: WithFallbackOptions = {},
): Promise<T | F | undefined> {
  try {
    return await promise;
  } catch (error) {
    onError?.(error);
    return fallback;
  }
}
