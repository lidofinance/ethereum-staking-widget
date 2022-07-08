// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parallelizePromises = (promises: Array<Promise<any>>) => {
  return Promise.allSettled(promises).then((settledResults) =>
    settledResults.map(
      (settled) => settled.status === 'fulfilled' && settled.value,
    ),
  );
};
