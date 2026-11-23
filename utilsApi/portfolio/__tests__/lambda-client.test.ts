import { createLambdaClient, LambdaHttpError } from '../lambda-client';

vi.mock('../../fetchApiWrapper', () => ({
  responseTimeExternalMetricWrapper: ({
    request,
  }: {
    request: () => unknown;
  }) => request(),
}));

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

describe('createLambdaClient', () => {
  it('sends POST with key verbatim, JSON body and joined URL', async () => {
    const fetcher = vi.fn().mockResolvedValue(okResponse({ a: 1 }));
    const client = createLambdaClient({
      apiKey: 'Bearer secret',
      baseUrl: 'https://lambda.test',
      fetcher: fetcher,
    });

    const result = await client.post('/path', { x: 1 }, 1000);

    expect(result).toEqual({ a: 1 });
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe('https://lambda.test/path');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer secret');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ x: 1 }));
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('uses the default base URL', async () => {
    const fetcher = vi.fn().mockResolvedValue(okResponse({}));
    const client = createLambdaClient({
      apiKey: 'k',
      fetcher: fetcher,
    });
    await client.post('/p', {}, 1000);
    expect(fetcher.mock.calls[0][0]).toBe('https://api.lambda.p2p.org/p');
  });

  it.each([400, 402, 429, 500])(
    'throws LambdaHttpError on %i',
    async (status) => {
      const fetcher = vi.fn().mockResolvedValue({ ok: false, status });
      const client = createLambdaClient({
        apiKey: 'k',
        fetcher: fetcher,
      });
      const error = (await client
        .post('/p', {}, 1000)
        .catch((e: unknown) => e)) as LambdaHttpError;
      expect(error).toBeInstanceOf(LambdaHttpError);
      expect(error.status).toBe(status);
    },
  );

  it('propagates fetcher errors', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network'));
    const client = createLambdaClient({
      apiKey: 'k',
      fetcher: fetcher,
    });
    await expect(client.post('/p', {}, 1000)).rejects.toThrow('network');
  });
});
