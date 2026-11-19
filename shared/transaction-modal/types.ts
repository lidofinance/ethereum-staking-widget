/**
 * Retry callback a failed transaction modal awaits. Form retries resolve with
 * the operation's success flag; disabled or invalid forms resolve false.
 * Pass it through as is so loading ends even when no new stage is shown.
 */
export type TxRetryHandler = () => void | boolean | Promise<void | boolean>;
