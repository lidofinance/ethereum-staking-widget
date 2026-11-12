import { type Transport, TimeoutError, withTimeout } from 'viem';

// Rejects a request the wrapped transport did not answer in time. viem's
// `http` transport times out on its own, a `custom` (EIP-1193) one does not:
// a provider that never answers would hold the request, and the fallback
// stack behind it, forever. A late answer is dropped.
export const timeoutTransport =
  (transport: Transport, timeout: number): Transport =>
  (params) => {
    const instance = transport(params);
    return {
      ...instance,
      request: (args, options) =>
        withTimeout(() => instance.request(args, options), {
          timeout,
          errorInstance: new TimeoutError({
            body: args,
            url: instance.config.name,
          }),
        }),
    };
  };
