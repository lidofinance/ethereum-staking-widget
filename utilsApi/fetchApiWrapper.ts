import Metrics from 'utilsApi/metrics';
import { Histogram } from 'prom-client';

export type FetchAPI<T = void> = () => Promise<T> | T;
export type MixedFetchWrapper = <T = void>(
  api: FetchAPI<T>,
) => FetchRequestWrapper<T>;

type FetchRequestWrapper<T = void> = <U extends string>(
  params?: U,
  next?: FetchAPI<T> | FetchRequestWrapper<T>,
) => Promise<T> | T;

export const wrapFetchRequest =
  <T = void>(wrappers: FetchRequestWrapper<T>[]) =>
  (requestHandler: FetchAPI<T>) =>
    wrappers.reduce(
      (acc, cur) => (params) => cur(params, () => acc(params)),
      requestHandler,
    );

export const responseTimeExternalMetric =
  <T = void>(metrics: Histogram<string>): FetchRequestWrapper<T> =>
  async (params, next) => {
    let status = 200;
    const endMetric = metrics.startTimer({ route: params });

    try {
      const result = await next?.(params, next);
      endMetric({ status });

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
