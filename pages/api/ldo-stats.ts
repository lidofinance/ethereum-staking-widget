import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { httpMethodGuard, HttpMethod, cors, gone } from 'utilsApi';

// TODO: delete after all other endpoints are deprecated on 9th september 2024
export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
])(gone);
