// one pending call at a time: a new schedule or cancel drops the previous one
export const createDelayedCall = (delayMs: number) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };

  const schedule = (fn: () => void) => {
    cancel();
    timer = setTimeout(() => {
      timer = undefined;
      fn();
    }, delayMs);
  };

  return { schedule, cancel };
};
