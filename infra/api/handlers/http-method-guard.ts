import type { FastifyReply, FastifyRequest } from 'fastify';

export enum HttpMethod {
  GET = 'GET',
  HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
  PATCH = 'PATCH',
}

export const httpMethodGuard =
  (methodAllowList: HttpMethod[]) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<boolean> => {
    const method = request?.method as HttpMethod | undefined;

    if (!method || !methodAllowList.includes(method)) {
      await reply.header('Allow', methodAllowList.join(', '));
      if (method !== HttpMethod.OPTIONS) {
        await reply
          .code(405)
          .send({ message: `You can use only: ${methodAllowList.toString()}` });
      } else {
        await reply.code(204).send();
      }
      return true;
    }

    return false;
  };
