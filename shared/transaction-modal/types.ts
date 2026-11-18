/**
 * Retry callback a failed transaction modal calls. `false` means nothing was
 * retried (e.g. the form is disabled): the modal keeps showing the failure
 * instead of waiting for a new attempt. Pass it through as is — a wrapper that
 * drops the return value leaves the Retry spinner running.
 */
export type TxRetryHandler = () => void | boolean;
