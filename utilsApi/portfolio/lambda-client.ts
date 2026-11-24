import { USER_AGENT } from 'config/groups/app';

import { responseTimeExternalMetricWrapper } from '../fetchApiWrapper';
import type { UpstreamGuard } from './upstream-guard';

export const LAMBDA_DEFAULT_BASE_URL = 'https://api.lambda.p2p.org';

export class LambdaHttpError extends Error {
  constructor(readonly status: number) {
    super(`Lambda request failed with status ${status}`);
  }
}

export type LambdaClientOptions = {
  apiKey: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
  guard?: UpstreamGuard;
};

export type LambdaClient = {
  post: (path: string, body: unknown, timeoutMs: number) => Promise<unknown>;
  get: (path: string, timeoutMs: number) => Promise<unknown>;
};

export const createLambdaClient = ({
  apiKey,
  baseUrl = LAMBDA_DEFAULT_BASE_URL,
  fetcher = fetch,
  guard,
}: LambdaClientOptions): LambdaClient => {
  const request = async (
    path: string,
    requestOptions: { method: 'GET' } | { method: 'POST'; body: unknown },
    timeoutMs: number,
  ): Promise<unknown> =>
    responseTimeExternalMetricWrapper<unknown, string>({
      payload: baseUrl,
      request: async () => {
        const response = await fetcher(`${baseUrl}${path}`, {
          method: requestOptions.method,
          headers: {
            Accept: 'application/json',
            ...(requestOptions.method === 'POST'
              ? { 'Content-Type': 'application/json' }
              : {}),
            'User-Agent': USER_AGENT,
            // value as issued by P2P, including any scheme prefix
            Authorization: apiKey,
          },
          body:
            requestOptions.method === 'POST'
              ? JSON.stringify(requestOptions.body)
              : undefined,
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) throw new LambdaHttpError(response.status);
        return (await response.json()) as unknown;
      },
    });

  const runGuarded = (upstreamCall: () => Promise<unknown>) =>
    guard ? guard.run(upstreamCall) : upstreamCall();

  return {
    post: async (path, body, timeoutMs) =>
      runGuarded(() => request(path, { method: 'POST', body }, timeoutMs)),
    get: async (path, timeoutMs) =>
      runGuarded(() => request(path, { method: 'GET' }, timeoutMs)),
  };
};
