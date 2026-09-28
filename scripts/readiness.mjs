// Readiness state shared between the custom server (server.mjs, plain ESM) and
// the Next-bundled API route. They are separate module graphs in the same
// process, so globalThis is the only channel — same pattern as the RPC and
// metrics singletons.
const state = globalThis.__appReadiness || { ready: false, reason: 'starting' };
globalThis.__appReadiness = state;

export const markReady = () => {
  state.ready = true;
  state.reason = undefined;
};

export const markNotReady = (reason) => {
  state.ready = false;
  state.reason = reason;
};

export const getReadiness = () => ({ ready: state.ready, reason: state.reason });
