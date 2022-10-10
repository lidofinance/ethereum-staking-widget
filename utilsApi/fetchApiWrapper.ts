import Metrics from 'utilsApi/metrics';
import { Histogram } from 'prom-client';

export type FetchAPI<T = void> = () => Promise<T> | T;
export type MixedFetchWrapper = <T = void, U = null>(data: {
  payload?: U;
  request: FetchAPI<T>;
}) => Promise<T> | T;

type FetchRequestWrapper<T = void> = <U = null>(
  params?: U,
  next?: FetchAPI<T> | FetchRequestWrapper<T>,
) => Promise<T> | T;

export const wrapFetchRequest =
  <T = void>(wrappers: FetchRequestWrapper<T>[]) =>
  <U = null>(data: { payload?: U; request: FetchAPI<T> }) =>
    wrappers.reduce(
      (acc, cur) => () => cur(data.payload, () => acc(data.payload)),
      data.request,
    )();

export const responseTimeExternalMetric =
  <T = void>(metrics: Histogram<string>): FetchRequestWrapper<T> =>
  async (params, next) => {
    let status = 200;
    const { hostname } = new URL(params as unknown as string);

    // TODO: fix types
    const endMetric = metrics.startTimer({
      hostname,
    });

    try {
      const result = await next?.(params, next);

      return result as T;
    } catch (error) {
      status = 500;
      // throw error up the stack
      throw error;
    } finally {
      endMetric({ status });
    }
  };

// ready wrapper types

export const responseTimeExternalMetricWrapper: MixedFetchWrapper =
  wrapFetchRequest([
    responseTimeExternalMetric(Metrics.request.apiTimingsExternal),
  ]);
