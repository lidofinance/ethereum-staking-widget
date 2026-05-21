import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import {
  defaultErrorHandler,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
} from 'utilsApi';
import { cspReportHandler } from 'utilsApi/csp-report-handler';

// 32KB fits original-policy + Reporting API v1 batched reports;
// well under Next.js' 1MB default to keep body sizes bounded.
export const config = {
  api: {
    bodyParser: { sizeLimit: '32kb' },
  },
};

export { cspReportHandler };

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.POST]),
  rateLimit,
  defaultErrorHandler,
])(cspReportHandler);
