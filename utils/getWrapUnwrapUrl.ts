import type { ParsedUrlQuery } from 'querystring';

const getQueryParams = (
  { ref, embed }: ParsedUrlQuery,
  concatSymbol: string,
) => {
  const params = new URLSearchParams();
  if (ref) params.append('ref', ref as string);
  if (embed) params.append('embed', embed as string);
  const paramsStr = params.toString();
  return paramsStr ? concatSymbol + paramsStr : '';
};

export const getWrapUrl = (query: ParsedUrlQuery) =>
  `/wrap${getQueryParams(query, '?')}`;

export const getUnwrapUrl = (query: ParsedUrlQuery) =>
  `/wrap?mode=unwrap${getQueryParams(query, '&')}`;
