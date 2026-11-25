// Builds an error callback that prints the error to the console under a scope,
// e.g. `onError: warnError('[useStake] post-stake balance read')`
export const warnError = (scope: string) => (error: unknown) =>
  console.warn(scope, error);
