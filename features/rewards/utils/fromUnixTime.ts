// Converts a Unix timestamp (in seconds) to a JavaScript Date object.
export const fromUnixTime = (unixTime: number): Date => {
  return new Date(unixTime * 1000);
};
