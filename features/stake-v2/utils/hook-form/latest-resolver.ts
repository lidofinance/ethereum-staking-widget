import { useMemo } from 'react';

/**
 * Wraps an async function so a call that a newer call superseded resolves
 * with the newest result instead of its own.
 *
 * Why for resolvers: react-hook-form applies `trigger` results in the order
 * they finish, with no check that the values are still current. A slow
 * validation (data read for one chain) finishing after a fast one (cached,
 * another chain) would put back a stale error. With this, every pending
 * validation settles on the latest one. Safe with RHF's own guards: an
 * onChange still drops a result when its field changed meanwhile, isValid
 * keeps its call id, and handleSubmit gets the current values' result.
 */
export const withLatestResult = <TArgs extends unknown[], TResult>(
  run: (...args: TArgs) => TResult | Promise<TResult>,
) => {
  let latest: Promise<Awaited<TResult>> | undefined;

  return async (...args: TArgs): Promise<Awaited<TResult>> => {
    let current = Promise.resolve(run(...args));
    latest = current;
    let result = await current;
    // a newer call started while this one ran: follow it to the end
    while (latest !== undefined && latest !== current) {
      current = latest;
      result = await current;
    }
    return result;
  };
};

/**
 * A resolver for useForm whose superseded validations take the latest
 * result (see withLatestResult). One per form instance: the latest call is
 * tracked per returned function.
 */
export const useLatestResolver = <TArgs extends unknown[], TResult>(
  resolver: (...args: TArgs) => TResult | Promise<TResult>,
) => useMemo(() => withLatestResult(resolver), [resolver]);
