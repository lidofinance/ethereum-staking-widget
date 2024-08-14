import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { httpMethodGuard, HttpMethod, cors, gone } from 'utilsApi';

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
])(gone);
