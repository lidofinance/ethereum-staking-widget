import { NextApiRequest, NextApiResponse } from 'next';
import { serverLogger } from 'utilsApi/serverLogger';
import getConfig from 'next/config';
const {
  serverRuntimeConfig: { metricsPort },
} = getConfig();

export const DEFAULT_API_ERROR_MESSAGE =
  'Something went wrong. Sorry, try again later :(';

const metrics = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const requested = await fetch(`http://localhost:${metricsPort}`);

    res.setHeader(
      'Content-Type',
      requested.headers.get('Content-Type') ?? 'text/plain',
    );
    res.status(requested.status).send(requested.body);
  } catch (error) {
    serverLogger.error(error);
    const errorMessage =
      error instanceof Error && error.message != null
        ? error.message
        : DEFAULT_API_ERROR_MESSAGE;
    res.status(500).json(errorMessage);
  }
};

export default metrics;
