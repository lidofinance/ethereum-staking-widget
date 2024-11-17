import {
  useQuery,
  UseQueryOptions,
  QueryFunction,
  QueryKey,
  UseQueryResult,
} from '@tanstack/react-query';

export type UseLidoQueryOptions<
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData,
> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData>,
  'queryKey' | 'queryFn'
> & {
  queryKey: QueryKey;
  queryFn: QueryFunction<TQueryFnData>;
  strategy?: Partial<UseQueryOptions<TQueryFnData, TError, TData>>;
};

export type UseLidoQueryResult<TData, TError = unknown> = UseQueryResult<
  TData | undefined,
  TError | null
> & {
  initialLoading: boolean;
  loading: boolean;
  isValidating: boolean;
};

export const useLidoQuery = <
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData,
>({
  queryKey,
  queryFn,
  strategy = {},
  ...options
}: UseLidoQueryOptions<TQueryFnData, TError, TData>): UseLidoQueryResult<
  TData,
  TError
> => {
  const result = useQuery<TQueryFnData, TError, TData>({
    ...strategy,
    ...options,
    queryKey,
    queryFn,
  });

  const { data, error, isLoading, isFetching } = result;

  return {
    // for full compatibility with UseQueryResult
    // the `isLoading` field doesn't bother us
    ...result,

    // additional fields (see: UseLidoQueryResult)
    initialLoading: isLoading && !data && !error,
    loading: isLoading || isFetching,
    isValidating: isLoading || isFetching,
  };
};
