export const getQueryParams = (
  isUnwrapMode: boolean,
  ref: string,
  embed: string,
  exclude?: Array<string>,
): string => {
  const queryParams = new URLSearchParams();

  if (!isUnwrapMode) {
    queryParams.append('mode', 'unwrap');
  }
  if (ref) {
    queryParams.append('ref', ref);
  }
  if (embed) {
    queryParams.append('embed', embed);
  }

  if (exclude) {
    exclude.forEach((item) => {
      if (queryParams.has(item)) {
        queryParams.delete(item);
      }
    });
  }

  return queryParams.toString();
};
