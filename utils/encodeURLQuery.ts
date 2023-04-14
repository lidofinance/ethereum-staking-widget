export const encodeURLQuery = (params: Record<string, string | number>) => {
  const encoder = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    encoder.set(key, encodeURIComponent(value));
  }
  return encoder.toString();
};
