import Fastify from 'fastify';

vi.mock('../../config.js', () => ({
  config: { ONE_INCH_API_KEY: undefined },
}));
vi.mock('../../metrics/index.js', () => ({ default: {} }));

import { oneInchRoute } from '../one-inch.js';

describe('/api/swap/one-inch without ONE_INCH_API_KEY', () => {
  it('404s with no-store and CORS', async () => {
    const app = Fastify({ logger: false });
    await app.register(oneInchRoute);

    const res = await app.inject({ url: '/api/swap/one-inch?token=ETH' });

    expect(res.statusCode).toBe(404);
    expect(res.headers['cache-control']).toBe('no-store, must-revalidate');
    expect(res.headers['access-control-allow-origin']).toBe('*');
    await app.close();
  });
});
