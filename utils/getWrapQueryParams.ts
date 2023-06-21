export const getQueryParamsString = (
  ref: string | string[] | undefined,
  embed: string | string[] | undefined,
): string => {
  const queryParams = new URLSearchParams();

  if (ref && typeof ref === 'string') {
    queryParams.append('ref', ref);
  }
  if (embed && typeof embed === 'string') {
    queryParams.append('embed', embed);
  }

  const qs = queryParams.toString();
  return qs ? '?' + qs : '';
};
