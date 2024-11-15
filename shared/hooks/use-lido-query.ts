import {
  useQuery,
  UseQueryOptions,
  QueryFunction,
  QueryKey,
} from '@tanstack/react-query';

interface UseLidoQueryOptions<TQueryFnData, TError, TData>
  extends Omit<
    UseQueryOptions<TQueryFnData, TError, TData>,
    'queryKey' | 'queryFn'
  > {
  queryKey: QueryKey;
  queryFn: QueryFunction<TQueryFnData>;
  strategy?: Partial<UseQueryOptions<TQueryFnData, TError, TData>>;
}

export const useLidoQuery = <
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData,
>({
  queryKey,
  queryFn,
  strategy = {},
  ...options
}: UseLidoQueryOptions<TQueryFnData, TError, TData>) => {
  const mergedOptions = {
    ...strategy,
    ...options,
    queryKey,
    queryFn,
  };

  const { data, error, isLoading, isFetching, refetch } =
    useQuery(mergedOptions);

  return {
    data,
    initialLoading: isLoading && !data && !error,
    loading: isLoading || isFetching,
    error,
    refetch,
  };
};
