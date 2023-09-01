export const awaitWithTimeout = <T>(toWait: Promise<T>, timeout: number) =>
  Promise.race([
    toWait,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('promise timeout')), timeout),
    ),
  ]);
