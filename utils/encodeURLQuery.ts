export const encodeURLQuery = (
  params: Record<string, string | number>,
): string => {
  const encoder = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== '') encoder.set(key, encodeURIComponent(value));
  }
  return encoder.toString();
};
