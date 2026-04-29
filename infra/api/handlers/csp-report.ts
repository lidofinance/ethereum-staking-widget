import { FastifyInstance } from 'fastify';

export const registerCspReportRoute = (app: FastifyInstance) => {
  app.route({
    method: ['POST'],
    url: '/api/csp-report',
    handler: async (request, reply) => {
      let violation: Record<string, unknown> = {};
      const body = request.body;

      if (body && typeof body === 'object' && !Array.isArray(body)) {
        violation = body as Record<string, unknown>;
      } else if (typeof body === 'string') {
        try {
          const parsed = JSON.parse(body);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            violation = parsed as Record<string, unknown>;
          }
        } catch {
          // Ignore invalid JSON body and keep an empty payload in logs.
        }
      }

      console.warn({
        type: 'CSP Violation',
        ...violation,
      });

      await reply.code(200).send({ status: 'ok' });
    },
  });
};
