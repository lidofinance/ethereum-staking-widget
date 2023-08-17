import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { defaultErrorHandler, rateLimit } from 'utilsApi';
import { API } from 'types';

const cspReport: API = async (req, res) => {
  console.warn({
    type: 'CSP Violation',
    ...req.body,
  });

  res.status(200).send({ status: 'ok' });
};

export default wrapNextRequest([rateLimit, defaultErrorHandler])(cspReport);
