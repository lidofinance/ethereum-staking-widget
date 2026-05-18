import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import {
  defaultErrorHandler,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
} from 'utilsApi';
import { cspReportHandler } from 'utilsApi/csp-report-handler';

// Cap body at 32KB. Generous margin over realistic CSP-violation payloads:
// each report includes the full `original-policy` string (our CSP is ~2-4KB
// after wallet-SDK hosts + SHA-256 hashes for inline scripts), plus
// `document-uri`/`referrer`/`source-file`/`script-sample` etc. The Reporting
// API v1 batches multiple reports in a single array, so 8KB was too tight in
// practice. 32KB stays 30× smaller than Next.js' 1MB default — still cuts
// large-body amplification but doesn't drop legitimate browser reports.
export const config = {
  api: {
    bodyParser: { sizeLimit: '32kb' },
  },
};

// Re-export the handler so it's also accessible at the route's own path
// (kept for callers / type tooling that import from the page file).
export { cspReportHandler };

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.POST]),
  rateLimit,
  defaultErrorHandler,
])(cspReportHandler);
