import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { defaultErrorHandler, rateLimit } from 'utilsApi';
import { API } from 'types';

const cspReport: API = async (req, res) => {
  let violation = {};

  if (typeof req.body == 'object') {
    violation = req.body;
  } else if (typeof req.body === 'string') {
    violation = JSON.parse(req.body);
  }

  console.warn({
    type: 'CSP Violation',
    ...violation,
  });

  res.status(200).send({ status: 'ok' });
};

export default wrapNextRequest([rateLimit, defaultErrorHandler])(cspReport);
