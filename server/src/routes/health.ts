import type { FastifyPluginAsync } from 'fastify';

export const healthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => ({ status: 'ok' }));
  fastify.get('/api/health', async () => ({ status: 'ok' }));
};
