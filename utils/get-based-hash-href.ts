export const getBasedHashHref = (
  href: string,
  query?: Record<string, string>,
) => {
  let queryString = new URLSearchParams(query).toString();
  queryString = queryString.length > 0 ? `?${queryString}` : '';

  // Make a link:
  // '/?<some_query_param>=<some_query_value>&...&<some_query_param_N>=<some_query_value_N>#/<hash_path>'
  // e.g.: '/#/wrap'
  // e.g.: '?ref=0x0000000000000000000000000000000000000000#/'
  return `/${queryString}#${href}`;
};
