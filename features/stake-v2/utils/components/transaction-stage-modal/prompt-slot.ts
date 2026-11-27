/**
 * The one pending question of a modal. It always settles: with the answer,
 * or with `null` when the modal is closed, replaced by a newer dispatch or
 * unmounted first. An answer after that is ignored, so a stale button
 * cannot answer the current question.
 */
export const createPromptSlot = () => {
  let dismissPending: (() => void) | null = null;

  const dismiss = () => {
    const dismissCurrent = dismissPending;
    dismissPending = null;
    dismissCurrent?.();
  };

  const open = <TResult>() => {
    dismiss();
    let resolvePromise!: (result: TResult | null) => void;
    const promise = new Promise<TResult | null>((resolve) => {
      resolvePromise = resolve;
    });

    const own = () => resolvePromise(null);
    dismissPending = own;

    const settle = (result: TResult) => {
      if (dismissPending !== own) return;
      dismissPending = null;
      resolvePromise(result);
    };
    return { promise, settle };
  };

  return { open, dismiss };
};
