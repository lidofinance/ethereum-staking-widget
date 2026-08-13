import type { FastifyPluginAsync } from 'fastify';
import { ROUTES } from '../consts.js';

export const healthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(ROUTES.health, async () => ({ status: 'ok' }));
  fastify.get(ROUTES.api.health, async () => ({ status: 'ok' }));
};
